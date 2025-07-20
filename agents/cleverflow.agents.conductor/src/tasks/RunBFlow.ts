import { CallToolResultSchema, CompatibilityCallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { Task, TaskStatus, DataPart } from "@cleverflow-ai/cleverflow.agents/schema";
import _, { create } from 'lodash';
import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType, Encoding, FieldEncoding, FieldType, OutputInputMatch } from '../baml_client/types.js';
import Session from '../sessions/Session.js';
import PersistenceService from '../services/PersistenceService.js';
import { z } from "zod";
import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { extractClientSession } from './Util.js';
import jsonata from 'jsonata';
import McpIO from "../mcp/McpIO.js";

export async function* runBFlow(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, Task | void, unknown> {

    const { bflow, userInput, outs } = extractData(context);

    if (!bflow) {
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'BFlow was missing'
                }, {
                    type: 'data',
                    data: {
                        createdAt: new Date(),
                    }
                }]
            }
        };
        return;
    }

    const queue: TaskStatus[] = [];

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'Working on it...'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    (async () => {
        try {
            const node = bflow.root;
            const result = await runNode(session, context, bflow, userInput, outs, node,
                (taskStatus: TaskStatus) => {
                    queue.push(taskStatus);
                }
            );

            if (result === BFlowNodeState.SUCCESS) {
                queue.push({
                    state: 'completed',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'BFlow execution completed successfully.'
                        }, {
                            type: 'data',
                            data: {
                                bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
            }

        } catch (err: any) {
            console.error('Error during BFlow execution:', err);
            queue.push({
                state: 'failed',
                message: {
                    role: 'agent',
                    parts: [{
                        type: 'text',
                        text: `Error: ${err.message}`
                    }, {
                        type: 'data',
                        data: {
                            createdAt: new Date(),
                        }
                    }]
                }
            });
        }
    })();

    let isDone = false;
    while (!isDone) {
        if (queue.length === 0) {
            // If the queue is empty, wait for a while before checking again
            await sleep(100);
            continue;
        }
        const taskStatus: TaskStatus = queue.shift();

        if (taskStatus.state === 'completed') {
            await PersistenceService.saveRunBFlow(session, outs);
        }

        yield taskStatus;
        if (['input-required', 'completed', 'failed'].includes(taskStatus.state)) {
            isDone = true;
        }
    }

    console.log('BFlow execution completed, yielding final result.');
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const runNode = async (session: Session, context: TaskContext, bflow: BFlow, userInput: Record<string, any>, outs: Record<string, any>, node: BFlowNode, yieldUpdate: (taskStatus: TaskStatus) => void): Promise<BFlowNodeState> => {

    console.log(`Running node: ${node.id} (${node.type})`);
    if (
        node.state === BFlowNodeState.SUCCESS ||
        node.state === BFlowNodeState.FAILURE) {
        return node.state;
    }

    if (node.type === BFlowNodeType.ENTRY) {
        node.state = BFlowNodeState.RUNNING;
        for (const child of node.goto!) {
            const state = await runNode(session, context, bflow, userInput, outs, child, yieldUpdate);
            if (state === BFlowNodeState.RUNNING || state === BFlowNodeState.WAITING_FOR_DATA) {
                child.state = state;
                yieldUpdate({
                    state: 'working',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'update'
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
                if (state === BFlowNodeState.WAITING_FOR_DATA) {
                    // STOP RUN BFLOW
                    return BFlowNodeState.WAITING_FOR_DATA;
                }
            } else if (state === BFlowNodeState.FAILURE) {
                child.state = BFlowNodeState.FAILURE;
                node.state = BFlowNodeState.FAILURE;
                yieldUpdate({
                    state: 'failed',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'update'
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
                // STOP RUN BFLOW
                return BFlowNodeState.FAILURE;
            }
        }

        node.state = BFlowNodeState.SUCCESS;

        // RUN BFLOW FINISH SUCCESSFULY
        return node.state;

    } else if (node.type === BFlowNodeType.FALLBACK) {
        node.state = BFlowNodeState.RUNNING;
        for (const child of node.goto!) {
            const state = await runNode(session, context, bflow, userInput, outs, child, yieldUpdate);
            if (state === BFlowNodeState.SUCCESS || state === BFlowNodeState.WAITING_FOR_DATA) {
                child.state = state;
                node.state = state;
                yieldUpdate({
                    state: 'working',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'update'
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
                return node.state;
            }
        }

        node.state = BFlowNodeState.FAILURE;
        yieldUpdate({
            state: 'failed',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'update'
                }, {
                    type: 'data',
                    data: {
                        bflow: bflow,
                        outs: outs,
                        createdAt: new Date(),
                    }
                }]
            }
        });
        return node.state;

    } else if (node.type === BFlowNodeType.SEQUENCE) {
        node.state = BFlowNodeState.RUNNING;
        for (const child of node.goto!) {
            const state = await runNode(session, context, bflow, userInput, outs, child, yieldUpdate);
            if (state === BFlowNodeState.SUCCESS) {
                child.state = state;
                yieldUpdate({
                    state: 'working',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'update'
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
            } else if (state === BFlowNodeState.FAILURE || state === BFlowNodeState.WAITING_FOR_DATA) {
                child.state = state;
                node.state = state;
                yieldUpdate({
                    state: 'failed',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'update'
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
                return node.state;
            }
        }

        node.state = BFlowNodeState.SUCCESS;
        yieldUpdate({
            state: 'working',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'update'
                }, {
                    type: 'data',
                    data: {
                        bflow: bflow,
                        outs: outs,
                        createdAt: new Date(),
                    }
                }]
            }
        });
        return node.state;

    } else if (node.type === BFlowNodeType.ACTION || node.type === BFlowNodeType.CONDITION) {
        let upstreamResults: any[] = [];

        try {
            if (node.inputs) {
                // Each Input corresponds a Node Id
                for (const nodeId of node.inputs) {
                    // Get saved Output of required Node
                    const out = outs[nodeId];
                    if (out) {
                        upstreamResults.push(out);
                    }
                }
            }
        } catch (exception) {
            console
        }

        node.state = BFlowNodeState.RUNNING;
        yieldUpdate({
            state: 'working',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'update'
                }, {
                    type: 'data',
                    data: {
                        bflow: bflow,
                        outs: outs,
                        createdAt: new Date(),
                    }
                }]
            }
        });

        if (node.tool) {
            const mcpClient = session.getClientByToolName(node.tool.name);
            if (mcpClient) {
                const mcpTool = mcpClient.tools.find((tool) => tool.name === node.tool.name);
                const requiredParameters = mcpTool.inputSchema?.required;
                let userInputForCurrentNode: any = userInput[node.id] || {};
                const upstreamResultsMapping = {};

                try {

                    if (upstreamResults && upstreamResults.length > 0) {
                        const upstreamResultsSkeleton = createSkeleton(upstreamResults);
                        const mappingInputOutput = await b.MatchNodeOutputsToToolInputs(
                            JSON.stringify(upstreamResultsSkeleton),
                            JSON.stringify(mcpTool),
                            {
                                clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
                            }
                        );

                        for (let i = 0; i < mappingInputOutput.length; i++) {
                            const item: OutputInputMatch = mappingInputOutput[i];
                            if (item.queryLanguage === 'jsonata') {
                                const expression = jsonata(item.query);
                                upstreamResultsMapping[item.field] = await expression.evaluate(upstreamResults);
                            }
                        }
                    }

                    // TODO: using coding as enum
                    // convert data using encoding
                    // upstreamResultData can be an array. 
                    // default upstreamResult using Base64 encoding???
                    // const fieldsEncoding = await b.DetectFieldEncodings(
                    //     JSON.stringify(mcpTool),
                    //     {
                    //         clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
                    //     }
                    // );

                    // _.forEach(fieldsEncoding, (fieldEncoding: FieldEncoding) => {
                    //     try {
                    //         const upstreamResultData = upstreamResultsMapping[fieldEncoding.field];
                    //         if (fieldEncoding.type === FieldType.Array) {
                    //             for (let i = 0; i < upstreamResultData.length; i++) {
                    //                 const itemData = upstreamResultData[i];
                    //                 if (fieldEncoding.itemEncoding === Encoding.Utf8) {
                    //                     upstreamResultData[i] = Buffer.from(itemData, "base64").toString("utf8");
                    //                 } else if (fieldEncoding.encoding === Encoding.ByteArray) {
                    //                     const buffer = Buffer.from(itemData, "base64");
                    //                     upstreamResultData[i] = Array.from(buffer);
                    //                 } else if (fieldEncoding.encoding === Encoding.Base64) {
                    //                     upstreamResultData[i] = itemData;
                    //                 }
                    //             }
                    //         } else {
                    //             if (fieldEncoding.encoding === Encoding.Utf8) {
                    //                 upstreamResultsMapping[fieldEncoding.field] = Buffer.from(upstreamResultData, "base64").toString("utf8");
                    //             } else if (fieldEncoding.encoding === Encoding.ByteArray) {
                    //                 const buffer = Buffer.from(upstreamResultData, "base64");
                    //                 upstreamResultsMapping[fieldEncoding.field] = Array.from(buffer);
                    //             } else if (fieldEncoding.encoding === Encoding.Base64) {
                    //                 upstreamResultsMapping[fieldEncoding.field] = upstreamResultData;
                    //             }
                    //         }

                    //     } catch (exception) {
                    //         console.error(exception);
                    //     }
                    // });

                    const clientSession = extractClientSession(context);
                    const extractedInputFromNodeContent = JSON.parse(node.toolInput ?? '{}');
                    userInputForCurrentNode = { ...extractedInputFromNodeContent, ...userInputForCurrentNode };

                    const canCallTool = isValidInput(requiredParameters || [], userInputForCurrentNode, upstreamResultsMapping)
                    if (!canCallTool) {
                        const mpcPayload = await b.GenerateMcpToolPayload(
                            JSON.stringify(mcpTool),
                            JSON.stringify(userInputForCurrentNode),
                            JSON.stringify(clientSession?.commonSettings ?? {}),
                            {
                                clientRegistry: new Clients({ primary: Clients.OllamaDefault }).registry
                            }
                        );

                        userInputForCurrentNode = mpcPayload ? JSON.parse(mpcPayload) : userInputForCurrentNode;

                        userInput[node.id] = userInputForCurrentNode;
                    }
                } catch (exception) {
                    console.error(exception);
                }

                const canCallTool = isValidInput(requiredParameters || [], userInputForCurrentNode, upstreamResultsMapping)
                if (!canCallTool) {
                    node.state = BFlowNodeState.WAITING_FOR_DATA;
                    yieldUpdate({
                        state: 'input-required',
                        message: {
                            role: 'agent',
                            parts: [{
                                type: 'data',
                                data: {
                                    node: {
                                        id: node.id
                                    },
                                    userInput,
                                    inputSchema: mcpTool,
                                    createdAt: new Date(),
                                }
                            }]
                        }
                    });
                    return node.state;
                }

                const mergedInput: Record<string, any> = {
                    ...userInputForCurrentNode,
                    ...upstreamResultsMapping,
                };

                const inputForCallTool = {
                    name: mcpTool.name,
                    arguments: mergedInput,
                };

                try {

                    const callToolResult = await mcpClient.client.callTool(
                        inputForCallTool,
                        z.any(),
                        {
                            timeout: 3600 * 1000,
                        },
                    );

                    // callTool error
                    if (callToolResult.isError) {
                        node.state = BFlowNodeState.FAILURE;
                        node.stateMessage = callToolResult.content &&
                            Array.isArray(callToolResult.content) &&
                            callToolResult.content.length > 0
                            ? callToolResult.content[0].text
                            : 'Cannot complete action. Please check your input or try again.';

                        yieldUpdate({
                            state: 'failed',
                            message: {
                                role: 'agent',
                                parts: [{
                                    type: 'text',
                                    text: node.stateMessage,
                                }, {
                                    type: 'data',
                                    data: {
                                        bflow: bflow,
                                        outs: outs,
                                        createdAt: new Date(),
                                    }
                                }]
                            }
                        });
                        return node.state;
                    }

                    node.state = BFlowNodeState.SUCCESS;

                    if (node.id) {
                        callToolResult.nodeId = node.id;

                        callToolResult.finishedAt = new Date().toISOString();
                        await PersistenceService.saveRunBFlowNodeOutput(session, node.id, callToolResult);

                        outs[node.id] = callToolResult;

                        yieldUpdate({
                            state: 'working',
                            message: {
                                role: 'agent',
                                parts: [{
                                    type: 'text',
                                    text: 'update'
                                }, {
                                    type: 'data',
                                    data: {
                                        bflow: bflow,
                                        outs: outs,
                                        createdAt: new Date(),
                                    }
                                }]
                            }
                        });
                    }

                } catch (callToolException) {
                    node.state = BFlowNodeState.FAILURE;
                    node.stateMessage = callToolException.message ?? 'Tool did not respond';
                    yieldUpdate({
                        state: 'failed',
                        message: {
                            role: 'agent',
                            parts: [{
                                type: 'text',
                                text: node.stateMessage,
                            }, {
                                type: 'data',
                                data: {
                                    bflow: bflow,
                                    outs: outs,
                                    createdAt: new Date(),
                                }
                            }]
                        }
                    });
                    return node.state;
                }
            } else {
                node.state = BFlowNodeState.FAILURE;
                node.stateMessage = 'Mcp client was not found';
                yieldUpdate({
                    state: 'failed',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: node.stateMessage
                        }, {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }]
                    }
                });
                return node.state;
            }

        } else {
            yieldUpdate({
                state: 'working',
                message: {
                    role: 'agent',
                    parts: [{
                        type: 'text',
                        text: 'Generating JS Code...'
                    }, {
                        type: 'data',
                        data: {
                            bflow: bflow,
                            outs: outs,
                            createdAt: new Date(),
                        }
                    }]
                }
            });
            const jsCode = await b.WriteJSCode(
                node.description,
                {
                    clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
                }
            );
            McpIO.runJSCode(jsCode, upstreamResults);
            // node.state = BFlowNodeState.FAILURE;
            // node.stateMessage = 'No MCP Tool';
            // yieldUpdate({
            //     state: 'failed',
            //     message: {
            //         role: 'agent',
            //         parts: [{
            //             type: 'text',
            //             text: node.stateMessage
            //         }, {
            //             type: 'data',
            //             data: {
            //                 bflow: bflow,
            //                 outs: outs,
            //                 createdAt: new Date(),
            //             }
            //         }]
            //     }
            // });
            // return node.state;
        }
    }

    return node.state;
}

const isValidInput = (required: Record<string, any>, userInput: Record<string, any>, upstreamResults: Record<string, any>) => {
    const mergedInput: Record<string, any> = {
        ...userInput,
        ...upstreamResults,
    };
    return required.every(key => {
        const value = mergedInput[key];
        return value !== undefined && value !== null && value !== '';
    });
}

const extractData = (context: TaskContext) => {

    // extract bflow
    let bflowPart: DataPart = context.userMessage.parts.find((part) => {
        return part.type === 'data' && part.data && part.data.bflow;
    }) as DataPart;

    if (!bflowPart && context.history && context.history.length > 0) {
        // find bflowPart from history
        const latestBflowEntry = [...context.history].reverse().find(entry =>
            entry.role === 'user' && entry.parts.some(part => part.type === 'data' && part.data && part.data.bflow)
        );

        if (latestBflowEntry) {
            bflowPart = latestBflowEntry.parts.find((part) => {
                return part.type === 'data' && part.data && part.data.bflow;
            }) as DataPart;
        }
    }

    let userInputValue = {};

    // extract userInput
    let userInputPart: DataPart = context.userMessage.parts.find((part) => {
        return part.type === 'data' && part.data && part.data.userInput;
    }) as DataPart;
    if (!userInputPart && context.history && context.history.length > 0) {
        // find bflowPart from history
        const latestUserInputEntry = [...context.history].reverse().find(entry =>
            entry.role === 'user' && entry.parts.some(part => part.type === 'data' && part.data && part.data.userInput)
        );
        if (latestUserInputEntry) {
            userInputPart = latestUserInputEntry.parts.find((part) => {
                return part.type === 'data' && part.data && part.data.userInput;
            }) as DataPart;
        }
    }

    userInputValue = userInputPart ? userInputPart.data.userInput : {};


    // extract outs
    const outs = {};

    for (const entry of context.history) {
        if (entry.role === 'agent') {
            for (const part of entry.parts) {
                if (part.type === 'data' && part.data && part.data.outs) {
                    for (const [key, value] of Object.entries(part.data.outs)) {
                        outs[key] = value;
                    }
                }
            }
        }
    }

    return {
        bflow: bflowPart ? bflowPart.data.bflow as BFlow : null,
        userInput: userInputValue,
        outs: outs,
    };
}

const createSkeleton = (obj: any): any => {
    if (typeof obj === 'string') {
        return 'dummy';
    } else if (typeof obj === 'number') {
        return 0;
    } else if (typeof obj === 'boolean') {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(createSkeleton);
    } else if (obj && typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            result[key] = createSkeleton(obj[key]);
        }
        return result;
    } else {
        return null;
    }
}
