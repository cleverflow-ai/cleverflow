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
        session.getMcpClientTools(),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
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

    const bflowviz = await b.ParseBFlowToBFlowViz(
        JSON.stringify(bflow),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
        });

    console.log(`>>>> bflow`);
    console.log(JSON.stringify(bflow));
    console.log(JSON.stringify(bflowviz));

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
                    bflowviz
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
                    bflow: { "id": null, "name": "MCP IO", "description": " ", "root": { "type": "SEQUENCE", "id": "cleverflow-mcp-a2a", "name": "MCP Flow", "description": null, "config": null, "state": null, "goto": [{ "type": "ACTION", "id": "action_1", "name": "Fetch File from Gitea", "description": "Fetching README.md file in repo atlascopco-dasm which onwed by clevernow from url https://gitea-atlascopco-integration.clevernow.com/api/v1 with key 04f4b0dada8fa8632dc7541f2f2131c703693e7e", "config": null, "state": null, "goto": [], "tool": { "name": "get_file_contents", "description": "Tool fetch-gitea-text-file from MCP client", "inputSchema": { "required": ["baseUrl", "apiKey", "repoOwner", "repo", "filePath"] } }, "toolInput": "{\"baseUrl\": \"https://gitea-atlascopco-integration.clevernow.com/api/v2\", \"apiKey\": \"04f4b0dada8fa8632dc7541f2f2131c703693e7e_\", \"repoOwner\": \"clevernow\", \"repo\": \"atlascopco-dasm\", \"filePath\": \"README.md\"}", "inputs": null, "output": null }, { "type": "ACTION", "id": "action_2", "name": "Fetch Outline File", "description": "Fetching a outline file by id sealing-technologies-rrOT5m2iSz from https://docs-atlascopco.clevernow.com/api with key ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO", "config": null, "state": null, "goto": [], "tool": { "name": "fetch-outline-text-file", "description": "Tool fetch-outline-text-file from MCP client", "inputSchema": { "required": ["fileId", "baseUrl", "apiKey"] } }, "toolInput": "{\"baseUrl\": \"https://docs-atlascopco.clevernow.com/api\", \"apiKey\": \"ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO\", \"fileId\": \"sealing-technologies-rrOT5m2iSz\"}", "inputs": null, "output": null }, { "type": "ACTION", "id": "action_3", "name": "Convert Steps to GLB", "description": "Convert a steps file to glb, some information may be required", "config": null, "state": null, "goto": [], "tool": { "name": "ping", "description": "Tool ping from MCP client", "inputSchema": { "required": [] } }, "toolInput": null, "inputs": null, "output": null }], "tool": null, "toolInput": null, "inputs": null, "output": null } },
                    bflowviz: { "nodes": [{ "type": "SEQUENCE", "id": "cleverflow-mcp-a2a", "parentNodeId": null, "name": "MCP Flow", "description": null, "config": null, "tool": null }, { "type": "ACTION", "id": "action_1", "parentNodeId": "cleverflow-mcp-a2a", "name": "Fetch File from Gitea", "description": "Fetching README.md file in repo atlascopco-dasm which onwed by clevernow from https://gitea-atlascopco-integration.clevernow.com/api/v1 with key 04f4b0dada8fa8632dc7541f2f2131c703693e7e", "config": null, "tool": { "name": "get_file_contents", "description": "Tool fetch-gitea-text-file from MCP client", "inputSchema": { "required": ["baseUrl", "apiKey", "repoOwner", "repo", "filePath"] } } }, { "type": "ACTION", "id": "action_2", "parentNodeId": "cleverflow-mcp-a2a", "name": "Fetch Outline File", "description": "Fetching a outline file by id sealing-technologies-rrOT5m2iSz from https://docs-atlascopco.clevernow.com/api with key ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO", "config": null, "tool": { "name": "fetch-outline-text-file", "description": "Tool fetch-outline-text-file from MCP client", "inputSchema": { "required": ["fileId", "baseUrl", "apiKey"] } } }, { "type": "ACTION", "id": "action_3", "parentNodeId": "cleverflow-mcp-a2a", "name": "Convert Steps to GLB", "description": "Convert a steps file to glb, some information may be required", "config": null, "tool": { "name": "ping", "description": "Tool ping from MCP client", "inputSchema": { "required": [] } } }], "edges": [{ "id": "0a1b2c3d4e5", "source": "cleverflow-mcp-a2a", "target": "action_1" }, { "id": "1a2b3c4d5e6", "source": "cleverflow-mcp-a2a", "target": "action_2" }, { "id": "2a3b4c5d6e7", "source": "cleverflow-mcp-a2a", "target": "action_3" }] }
                }
            }]
        }
    };
}