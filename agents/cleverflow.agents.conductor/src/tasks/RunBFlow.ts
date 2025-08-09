import { CallToolResultSchema, CompatibilityCallToolResultSchema, ListToolsResultSchema, Progress } from "@modelcontextprotocol/sdk/types.js";
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
                    console.log(`>>>>>>>`);
                    console.log(`>>>>>>>`);
                    console.log(`>>>>>>>`);
                    console.log(`>>>> node.inputs`);
                    if (out) {
                        console.log(`>>>> nodeId: ${nodeId}`);
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
            // TODO: hardcode tool name
            if (node.tool.name === 'execute_prompt') {
                return await runNodeUsingLLM(session, bflow, outs, node, upstreamResults, yieldUpdate);
            } else if (node.tool.name === 'execute_js') {
                return await runNodeUsingLLMAndV8(session, bflow, outs, node, upstreamResults, yieldUpdate);
            } else {
                return await runNodeWithMcpTool(session, context, bflow, userInput, outs, node, upstreamResults, yieldUpdate);
            }
        } else {
            return await runNodeUsingLLMAndV8(session, bflow, outs, node, upstreamResults, yieldUpdate);
        }
    }

    return node.state;
}

const runNodeWithMcpTool = async (session: Session, context: TaskContext, bflow: BFlow, userInput: Record<string, any>, outs: Record<string, any>, node: BFlowNode, upstreamResults: any[], yieldUpdate: (taskStatus: TaskStatus) => void): Promise<BFlowNodeState> => {
    const mcpClient = session.getMcpClientByToolName(node.tool.name);
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
                    if (item.queryLanguage === 'jsonata' && item.query) {
                        try {
                            const expression = jsonata(item.query);
                            const expressionData = await expression.evaluate(upstreamResults);
                            if (expressionData) {
                                upstreamResultsMapping[item.field] = expressionData;
                            }
                        } catch (exception) {
                        }
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
            const extractedInputFromNodeContent = JSON.parse(node.toolInputJson ?? '{}');
            userInputForCurrentNode = { ...extractedInputFromNodeContent, ...userInputForCurrentNode };

            const canCallTool = isValidInput(requiredParameters || [], userInputForCurrentNode, upstreamResultsMapping)
            if (!canCallTool) {
                let mpcPayload = await b.GenerateMcpToolPayload(
                    JSON.stringify(mcpTool),
                    JSON.stringify(userInputForCurrentNode),
                    JSON.stringify(clientSession?.commonSettings ?? {}),
                    {
                        clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
                    }
                );

                if (mpcPayload) {
                    mpcPayload = mpcPayload.replace('```json', '').replace('```', '').trim();
                }

                console.log('>>>>> GenerateMcpToolPayload');
                console.log('>>>>> GenerateMcpToolPayload');
                console.log('>>>>> GenerateMcpToolPayload');
                console.log(mpcPayload);

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
        } else {
            const mergedInput: Record<string, any> = {
                ...userInputForCurrentNode,
                ...upstreamResultsMapping,
            };

            const inputForCallTool = {
                name: mcpTool.name,
                arguments: mergedInput,
            };

            try {

                mcpClient.client.setNotificationHandler(z.object({
                    method: z.literal("notifications/message"),
                    params: z.object({
                        level: z.string(),
                        message: z.string()
                    }).optional()
                }), (notification) => {
                    outs[node.id] = {};
                    node.stateMessage = notification.params?.message ?? 'Received notification from MCP Tool';
                    yieldUpdate({
                        state: 'working',
                        message: {
                            role: 'agent',
                            parts: [
                                { type: 'text', text: 'update' },
                                {
                                    type: 'data',
                                    data: {
                                        bflow: bflow,
                                        outs: outs,
                                        createdAt: new Date(),
                                    }
                                }
                            ]
                        }
                    });
                });
                const callToolResult = await mcpClient.client.callTool(
                    inputForCallTool,
                    z.any(),
                    {
                        timeout: 1 * 60 * 60 * 1000,
                        resetTimeoutOnProgress: true,
                        maxTotalTimeout: 1 * 60 * 60 * 1000,
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
                } else {
                    node.state = BFlowNodeState.SUCCESS;

                    if (node.id) {
                        callToolResult.nodeId = node.id;

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
            }
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
    }
    return node.state;
}

const runNodeUsingLLMAndV8 = async (session: Session, bflow: BFlow, outs: Record<string, any>, node: BFlowNode, upstreamResults: any[], yieldUpdate: (taskStatus: TaskStatus) => void): Promise<BFlowNodeState> => {
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
    let jsCode = await b.WriteJSCode(
        node.description,
        {
            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
        }
    );
    jsCode = jsCode.replaceAll('<think>', '').replaceAll('</think>', '');
    console.log(`>>>> jsCode`);
    console.log(jsCode);

    console.log(`>>> upstreamResults: ${upstreamResults.length}`);
    // TODO
    let jsCodeInput: any = null;
    if (upstreamResults && upstreamResults.length > 0) {
        if (upstreamResults.length === 1) {
            const result = upstreamResults[0];
            if (result.content && Array.isArray(result.content)) {
                const content = result.content[0];
                if (content.type === 'text') {
                    jsCodeInput = content.text;
                } else if (content.type === 'resource') {
                    if (content.resource?.encoding === 'base64' && content.resource?.mimeType === 'text/plain') {
                        if (Array.isArray(content.resource?.blob)) {
                            jsCodeInput = content.resource?.blob.map((data: any) => Buffer.from(data, 'base64').toString('utf-8'));
                        } else {
                            jsCodeInput = Buffer.from(content.resource?.blob, 'base64').toString('utf-8');
                        }
                    } else {
                        jsCodeInput = content.resource?.blob;
                    }
                } else {
                    jsCodeInput = content;
                }
            } else {
                jsCodeInput = result;
            }
        } else {
            jsCodeInput = [];
            _.forEach(upstreamResults, (result) => {
                if (result.content && Array.isArray(result.content)) {
                    const content = result.content[0];
                    if (content.type === 'text') {
                        jsCodeInput.push(content.text);
                    } else if (content.type === 'resource') {
                        if (content.resource?.encoding === 'base64' && content.resource?.mimeType === 'text/plain') {
                            if (Array.isArray(content.resource?.blob)) {
                                const decoded = content.resource?.blob.map((data: any) => Buffer.from(data, 'base64').toString('utf-8'));
                                jsCodeInput.push(decoded);
                            } else {
                                const decoded = Buffer.from(content.resource?.blob, 'base64').toString('utf-8');
                                jsCodeInput.push(decoded);
                            }
                        } else {
                            jsCodeInput.push(content.resource?.blob);
                        }
                    } else {
                        jsCodeInput.push(content);
                    }
                } else {
                    jsCodeInput.push(result);
                }
            });
        }
    }
    console.log('>>>> jsCodeInput');
    console.log(JSON.stringify(jsCodeInput));

    const callToolResult = await McpIO.runJSCode(jsCode, jsCodeInput);
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

    } else {
        node.state = BFlowNodeState.SUCCESS;

        if (node.id) {
            callToolResult.nodeId = node.id;
            callToolResult.jsCode = jsCode;

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
    }
    return node.state;
}

const runNodeUsingLLM = async (session: Session, bflow: BFlow, outs: Record<string, any>, node: BFlowNode, upstreamResults: any[], yieldUpdate: (taskStatus: TaskStatus) => void): Promise<BFlowNodeState> => {

    node.state = BFlowNodeState.RUNNING;

    yieldUpdate({
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'Preparing prompt...'
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

    // SMELL
    const nodeOutput = {
        nodeId: node.id,
        content: [
            {
                type: "resource",
                resource: {
                    mimeType: 'text/plain',
                    encoding: 'utf8',
                    blob: [],
                }
            }
        ],
        finishedAt: new Date().toISOString(),
    };

    let upstreamData: any = null;
    const result = upstreamResults && upstreamResults.length > 0 ? upstreamResults[0] : null;
    console.log('>>>> get upstreamData');
    if (result.content && Array.isArray(result.content)) {
        const content = result.content[0];
        if (content.type === 'text') {
            upstreamData = content.text;
        } else if (content.type === 'resource') {
            upstreamData = content.resource?.blob;
        }
    }

    if (node.repeat && Array.isArray(upstreamData)) {

        outs[node.id] = nodeOutput;

        node.stateMessage = `0/${upstreamData.length} completed!`;

        yieldUpdate({
            state: 'working',
            message: {
                role: 'agent',
                parts: [
                    { type: 'text', text: 'update' },
                    {
                        type: 'data',
                        data: {
                            bflow: bflow,
                            outs: outs,
                            createdAt: new Date(),
                        }
                    }
                ]
            }
        });

        const concurrency = 8;

        for (let i = 0; i < upstreamData.length; i += concurrency) {
            const batch = upstreamData.slice(i, i + concurrency);

            const results = await Promise.all(
                batch.map(promptInput =>
                    b.ExecuteDynamicTask(
                        node.description,
                        promptInput ? JSON.stringify(promptInput) : '',
                        {
                            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
                        }
                    )
                )
            );

            _.forEach(results, (result) => {
                nodeOutput.content[0].resource.blob.push(result);
            });

            outs[node.id] = nodeOutput;

            node.stateMessage = `${i + concurrency}/${upstreamData.length} completed!`;

            await PersistenceService.saveRunBFlowNodeOutput(session, node.id, nodeOutput);

            yieldUpdate({
                state: 'working',
                message: {
                    role: 'agent',
                    parts: [
                        { type: 'text', text: 'update' },
                        {
                            type: 'data',
                            data: {
                                bflow: bflow,
                                outs: outs,
                                createdAt: new Date(),
                            }
                        }
                    ]
                }
            });
        }
    } else {
        let result = await b.ExecuteDynamicTask(
            node.description,
            upstreamData ? JSON.stringify(upstreamData) : '',
            {
                clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
            }
        );
        nodeOutput.content[0].resource.blob.push(result);
    }

    node.state = BFlowNodeState.SUCCESS;
    outs[node.id] = nodeOutput;

    await PersistenceService.saveRunBFlowNodeOutput(session, node.id, nodeOutput);

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
            if (['blob'].includes(key)) {
                if (Array.isArray(obj[key])) {
                    result[key] = [];
                } else if (typeof obj[key] === 'object') {
                    result[key] = {};
                } else {
                    result[key] = 'dummy';
                }
            } else {
                result[key] = createSkeleton(obj[key]);
            }
        }
        return result;
    } else {
        return null;
    }
}
