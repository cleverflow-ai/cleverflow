import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType } from '../baml_client/types.js';
import { z } from "zod";
import Session from '../sessions/Session.js';
import PersistenceService from '../services/PersistenceService.js';

import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';

export async function* runBFlow(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

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

    const queue: TaskYieldUpdate[] = [];

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
                (taskYieldUpdate: TaskYieldUpdate) => {
                    queue.push(taskYieldUpdate);
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
        const taskYieldUpdate = queue.shift();

        if (taskYieldUpdate.state === 'completed') {
            await PersistenceService.saveRunBFlow(context, outs);
        }

        yield taskYieldUpdate;
        if (['input-required', 'completed', 'failed'].includes(taskYieldUpdate.state)) {
            isDone = true;
        }
    }

    console.log('BFlow execution completed, yielding final result.');
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const runNode = async (session: Session, context: TaskContext, bflow: BFlow, userInput: Map<string, any>, outs: Map<string, any>, node: BFlowNode, yieldUpdate: (taskYieldUpdate: TaskYieldUpdate) => void): Promise<BFlowNodeState> => {

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
        if (node.tool) {
            let inputs: any[] = [];

            if (node.inputs) {
                // Each Input corresponds a Node Id
                for (const nodeId of node.inputs) {
                    // Get saved Output of required Node
                    const out = outs.get(nodeId);
                    const outResult = out?.result;
                    if (outResult) {
                        inputs.push(outResult);
                    }
                }
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

            const mcpClient = session.getClientByToolName(node.tool.name);
            if (mcpClient) {
                const mcpTool = mcpClient.tools.find((tool) => tool.name === node.tool.name);
                const requiredParameters = mcpTool.inputSchema?.required;
                let userInputForCurrentNode: any = userInput[node.id] || {};
                try {
                    const extractedInputFromNodeContent = JSON.parse(node.toolInput ?? '{}');
                    userInputForCurrentNode = { ...extractedInputFromNodeContent, ...userInputForCurrentNode };
                } catch (exception) {
                }
                s
                const canCallTool = isValidInput(requiredParameters || [], userInputForCurrentNode)
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

                const inputForCallTool = {
                    name: mcpTool.name,
                    arguments: userInputForCurrentNode,
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
                        node.state = BFlowNodeState.WAITING_FOR_DATA;
                        const errorMessage =
                            callToolResult.content &&
                                Array.isArray(callToolResult.content) &&
                                callToolResult.content.length > 0
                                ? callToolResult.content[0].text
                                : '';
                        yieldUpdate({
                            state: 'input-required',
                            message: {
                                role: 'agent',
                                parts: [{
                                    type: 'text',
                                    text: errorMessage,
                                }, {
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

                    node.state = BFlowNodeState.SUCCESS;

                    if (node.id) {
                        outs[node.id] = callToolResult;

                        const nodeOutput = {};
                        nodeOutput[node.id] = callToolResult;
                        await PersistenceService.saveRunBFlowNodeOutput(context, node.id, nodeOutput);

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
                    node.state = BFlowNodeState.WAITING_FOR_DATA;
                    yieldUpdate({
                        state: 'input-required',
                        message: {
                            role: 'agent',
                            parts: [{
                                type: 'text',
                                text: callToolException.message ?? 'Tool did not respond',
                            }, {
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
            } else {
                node.state = BFlowNodeState.FAILURE;
                yieldUpdate({
                    state: 'failed',
                    message: {
                        role: 'agent',
                        parts: [{
                            type: 'text',
                            text: 'Mcp client was not found'
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
            yieldUpdate({
                state: 'failed',
                message: {
                    role: 'agent',
                    parts: [{
                        type: 'text',
                        text: 'No MCP Tool'
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

    return node.state;
}

const isValidInput = (required, userInput) => {
    return required.every(key => {
        const value = userInput[key];
        return value !== undefined && value !== null && value !== '';
    });
}

const extractData = (context: TaskContext) => {

    // extract bflow
    let bflowPart = context.userMessage.parts.find((part) => {
        return part.type === 'data' && part.data && part.data.bflow;
    });
    if (!bflowPart && context.history && context.history.length > 0) {
        // find bflowPart from history
        const latestBflowEntry = [...context.history].reverse().find(entry =>
            entry.role === 'user' && entry.parts.some(part => part.type === 'data' && part.data && part.data.bflow)
        );

        if (latestBflowEntry) {
            bflowPart = latestBflowEntry.parts.find((part) => {
                return part.type === 'data' && part.data && part.data.bflow;
            });
        }
    }

    // extract userInput
    let userInputPart = context.userMessage.parts.find((part) => {
        return part.type === 'data' && part.data && part.data.userInput;
    });
    if (!userInputPart && context.history && context.history.length > 0) {
        // find bflowPart from history
        const latestUserInputEntry = [...context.history].reverse().find(entry =>
            entry.role === 'user' && entry.parts.some(part => part.type === 'data' && part.data && part.data.userInput)
        );
        if (latestUserInputEntry) {
            userInputPart = latestUserInputEntry.parts.find((part) => {
                return part.type === 'data' && part.data && part.data.userInput;
            });
        }
    }

    // extract outs
    const outs: any = {};

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
        bflow: bflowPart ? bflowPart.data.bflow : null,
        userInput: userInputPart ? userInputPart.data.userInput : {},
        outs: outs,
    };
}