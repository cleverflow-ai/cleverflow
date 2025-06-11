import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';

export async function* generateBFlow(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_MARKDOC_ELEMENT_TO_BFLOW'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    const textPart = context.userMessage.parts.find((part) => part.type === 'text');

    if (!textPart || !textPart.text) {
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'text was missing'
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
    const text = textPart.text;

    const bflow = await b.ParseMarkdocBFlowElementToBFlow(
        text,
        session.getMcpClientInfo(),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_BFLOW_TO_BFLOWVIZ'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    const bflowViz = await b.ParseBFlowToBFlowViz(
        JSON.stringify(bflow),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    yield {
        state: 'completed',
        message: {
            role: 'agent',
            parts: [{
                type: 'data',
                data: {
                    bflow,
                    bflowViz
                }
            }]
        }
    };
}

export async function* generateBFlowTest(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

    yield {
        state: 'completed',
        message: {
            role: 'agent',
            parts: [{
                type: 'data',
                data: {
                    bflow: { "id": null, "name": null, "description": null, "root": { "type": "ENTRY", "id": "entry_1", "name": null, "description": null, "config": null, "state": null, "goto": [{ "type": "SEQUENCE", "id": "sequence_1", "name": null, "description": null, "config": null, "state": null, "goto": [{ "type": "ACTION", "id": "action_1", "name": "task-1", "description": "Fetching a gitea file", "config": null, "state": null, "goto": null, "tool": { "name": "fetch-gitea-text-file", "description": "Tool fetch-gitea-text-file from MCP client" }, "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_2", "name": "task-2", "description": "Fetching a outline file", "config": null, "state": null, "goto": null, "tool": { "name": "fetch-outline-text-file", "description": "Tool fetch-outline-text-file from MCP client" }, "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_3", "name": "task-3", "description": "Convert a steps file to glb", "config": null, "state": null, "goto": null, "tool": { "name": "convert-step-to-glb", "description": "Tool convert-step-to-glb from MCP client" }, "inputs": [], "output": {} }], "tool": null, "inputs": [], "output": {} }], "tool": null, "inputs": [], "output": {} } },
                    bflowViz: { "nodes": [{ "type": "ENTRY", "id": "entry_1", "parentNodeId": null, "name": null, "description": null, "config": null, "tool": null }, { "type": "SEQUENCE", "id": "sequence_1", "parentNodeId": "entry_1", "name": null, "description": null, "config": null, "tool": null }, { "type": "ACTION", "id": "action_1", "parentNodeId": "sequence_1", "name": "task-1", "description": "Fetching a gitea file", "config": null, "tool": { "name": "fetch-gitea-text-file", "description": "Tool fetch-gitea-text-file from MCP client" } }, { "type": "ACTION", "id": "action_2", "parentNodeId": "sequence_1", "name": "task-2", "description": "Fetching a outline file", "config": null, "tool": { "name": "fetch-outline-text-file", "description": "Tool fetch-outline-text-file from MCP client" } }, { "type": "ACTION", "id": "action_3", "parentNodeId": "sequence_1", "name": "task-3", "description": "Convert a steps file to glb", "config": null, "tool": { "name": "convert-step-to-glb", "description": "Tool convert-step-to-glb from MCP client" } }], "edges": [{ "id": "edge_1", "source": "entry_1", "target": "sequence_1" }, { "id": "edge_2", "source": "sequence_1", "target": "action_1" }, { "id": "edge_3", "source": "sequence_1", "target": "action_2" }, { "id": "edge_4", "source": "sequence_1", "target": "action_3" }] }
                }
            }]
        }
    };
}