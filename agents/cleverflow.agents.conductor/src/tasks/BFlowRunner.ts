import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType } from '../baml_client/types.js';
import mcpClientManager from '../mcp/McpClientManager.js';
import { z } from "zod";

export async function* runBFlow(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    const dataPart = context.userMessage.parts.find((part) => part.type === 'data');

    if (!dataPart || !dataPart.data || !dataPart.data.bflow) {
        yield {
            state: 'input-required',
            message: { role: 'agent', parts: [{ type: 'text', text: 'BFlow was missing' }] }
        };
        return;
    }

    const bflow = dataPart.data.bflow as BFlow;
    console.log('Running BFlow:', bflow);

    const queue: TaskYieldUpdate[] = [];
    const outs = new Map<string, any>();



    yield {
        state: 'working',
        message: { role: 'agent', parts: [{ type: 'text', text: 'Working on it...' }] }
    };

    (async () => {
        try {
            await runNode(bflow.root, outs,
                (taskYieldUpdate: TaskYieldUpdate) => {
                    queue.push(taskYieldUpdate);
                }
            );
        } catch (err: any) {
            queue.push({
                state: 'failed',
                message: {
                    role: 'agent',
                    parts: [{ type: 'text', text: `Error: ${err.message}` }]
                }
            });
        } finally {
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
                            outs: Object.fromEntries(outs)
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
        yield taskYieldUpdate;
        if (taskYieldUpdate.state === 'completed') {
            console.log('BFlow execution completed, yielding final result.');
            isDone = true;
        }
    }

    console.log('BFlow execution completed, yielding final result.');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const runNode = async (node: BFlowNode, outs: Map<string, any>, yieldUpdate: (taskYieldUpdate: TaskYieldUpdate) => void): Promise<BFlowNodeState> => {

    console.log(`Running node: ${node.id} (${node.type})`);
    if (node.state === BFlowNodeState.SUCCESS) {
        return node.state;
    }

    if (node.type === BFlowNodeType.ENTRY) {

        for (const child of node.goto!) {
            const status = await runNode(child, outs, yieldUpdate);
            if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                return BFlowNodeState.WAITING_FOR_CLIENT;
            }
        }

    } else if (node.type === BFlowNodeType.FALLBACK) {

        for (const child of node.goto!) {
            const status = await runNode(child, outs, yieldUpdate);
            if (status === BFlowNodeState.SUCCESS) {
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
                                bflow: {},
                                outs: Object.fromEntries(outs)
                            }
                        }]
                    }
                });
                return node.state;
            } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                return BFlowNodeState.WAITING_FOR_CLIENT;
            }
        }

        node.state = BFlowNodeState.FAILURE;
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
                        bflow: {},
                        outs: Object.fromEntries(outs)
                    }
                }]
            }
        });
        return node.state;

    } else if (node.type === BFlowNodeType.SEQUENCE) {

        for (const child of node.goto!) {
            const status = await runNode(child, outs, yieldUpdate);
            if (status === BFlowNodeState.FAILURE) {
                node.state = BFlowNodeState.FAILURE;
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
                                bflow: {},
                                outs: Object.fromEntries(outs)
                            }
                        }]
                    }
                });
                return node.state;
            } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                return BFlowNodeState.WAITING_FOR_CLIENT;
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
                        bflow: {},
                        outs: Object.fromEntries(outs)
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
                            bflow: {},
                            outs: Object.fromEntries(outs)
                        }
                    }]
                }
            });

            const mcpClient = mcpClientManager.getClientByToolName(node.tool.name);
            console.log(`>>> mcpClient: ${mcpClient}`);
            if (mcpClient) {
                const mcpTool = mcpClient.tools.find((tool) => tool.name === node.tool.name);
                const requiredParameters = mcpTool.inputSchema?.required;
                const userInput: any = node.userInput || {};
                const canCallTool = isValidInput(requiredParameters || [], userInput)
                console.log(`>>> canCallTool: ${canCallTool}`);
                if (!canCallTool) {
                    console.error(`Invalid input for tool ${mcpTool.name}. Required parameters: ${requiredParameters}`);
                    node.state = BFlowNodeState.FAILURE;
                    yieldUpdate({
                        state: 'input-required',
                        message: {
                            role: 'agent',
                            parts: [{
                                type: 'text',
                                text: 'update'
                            }, {
                                type: 'data',
                                data: {
                                    inputSchema: mcpTool.inputSchema
                                }
                            }]
                        }
                    });
                    return node.state;
                }
                const result = await mcpClient.client.callTool(
                    {
                        name: mcpTool.name,
                        arguments: userInput,
                    },
                    z.any(),
                    {
                        timeout: 3600 * 1000,
                    },
                );
                if (node.id) {
                    outs.set(node.id, result);
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
                                    bflow: {},
                                    outs: Object.fromEntries(outs)
                                }
                            }]
                        }
                    });
                    return node.state;
                }
            }
        } else {
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
                            bflow: {},
                            outs: Object.fromEntries(outs)
                        }
                    }]
                }
            });
            return node.state;
        }
    }

    return BFlowNodeState.FAILURE;
}

const isValidInput = (required, userInput) => {
    return required.every(key => {
        const value = userInput[key];
        return value !== undefined && value !== null && value !== '';
    });
}

