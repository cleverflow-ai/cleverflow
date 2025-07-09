import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';
import PersistenceService from '../services/PersistenceService.js';

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

    console.log(`>>>>>>>> markdoc`);
    console.log(text);

    const bflow = await b.ParseMarkdocBFlowElementToBFlow(
        text,
        session.getMcpClientTools(),
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

    const bflowviz = await b.ParseBFlowToBFlowViz(
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

    await PersistenceService.saveGenerateBFlow(session, bflow, bflowviz);

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
                    bflow: { "id": "test-mcp-conversion", "name": "MCP Conversion Test", "description": "A behavior tree for testing MCP conversion.", "root": { "type": "SEQUENCE", "id": "sequence_1", "name": "Sequence Node", "description": null, "config": null, "state": null, "goto": [{ "type": "ACTION", "id": "action_1", "name": "Fetch PDF File", "description": "Fetches a PDF file from the specified URL.", "config": null, "state": null, "goto": null, "tool": { "name": "get_file_contents", "description": "Tool get_file_contents from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } }, "toolInput": "{ \"url\": \"https://gitea-atlascopco-integration.clevernow.com/api/v1\", \"token\": null, \"branch\": \"main\", \"owner\": \"clevernow\", \"repo\": \"atlascopco-dasm\", \"path\": \"flows/examples/planet_history.pdf\" }", "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_2", "name": "Convert PDF to Text", "description": "Converts the content of a previously fetched PDF file into text.", "config": null, "state": null, "goto": null, "tool": { "name": "convert_doc_files_into_text_chunks", "description": "Tool convert_doc_files_into_text_chunks from MCP client", "inputSchema": { "required": ["payloads"] } }, "toolInput": "{ \"payloads\": [\"action_1\"] }", "inputs": ["action_1"], "output": {} }], "tool": null, "toolInput": null, "inputs": null, "output": null } },
                    bflowviz: { "nodes": [{ "type": "SEQUENCE", "id": "sequence_1", "parentNodeId": null, "name": "Sequence Node", "description": null, "config": null, "tool": null }, { "type": "ACTION", "id": "action_1", "parentNodeId": "sequence_1", "name": "Fetch PDF File", "description": "Fetches a PDF file from the specified URL.", "config": null, "tool": { "name": "get_file_contents", "description": "Tool get_file_contents from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } } }, { "type": "ACTION", "id": "action_2", "parentNodeId": "sequence_1", "name": "Convert PDF to Text", "description": "Converts the content of a previously fetched PDF file into text.", "config": null, "tool": { "name": "convert_doc_files_into_text_chunks", "description": "Tool convert_doc_files_into_text_chunks from MCP client", "inputSchema": { "required": ["payloads"] } } }], "edges": [{ "id": "edge_1", "source": "sequence_1", "target": "action_1" }, { "id": "edge_2", "source": "sequence_1", "target": "action_2" }] }
                }
            }]
        }
    };
}
