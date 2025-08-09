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
            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
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
                    bflow: { "id": "bflow-crawl-terminology", "name": "Crawl Terminology Data", "description": "", "root": { "type": "SEQUENCE", "id": "sequence_1", "name": "Sequence Node", "description": null, "repeat": false, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [{ "type": "ACTION", "id": "action_1", "name": "Crawl Terminology Data from MemoQWeb", "description": "Crawl terminology data from MemoQWeb", "repeat": false, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "terminologies_crawler", "description": "\n            Description:\n                This tool logs in to the MemoQ Web interface (https://memoq.t-works.eu/memoqweb) for the specified workspace and crawls all available terminologies from its QTerm termbases.\n                It authenticates using the provided username and password, enumerates all termbases available to the user, and for each termbase, retrieves every term entry on every page, including detailed metadata and translations.\n                The collected data is returned as a UTF-8 encoded resource, typically in JSON format.\n\n            Inputs:\n                workspaceId (string) — Identifier of the workspace/termbase group to crawl.\n                username (string) — MemoQ Web username.\n                password (string) — MemoQ Web password.\n\n            Output format (JSON, preferred):\n            json\n                [\n                    {\n                        \"materialnummer\": \"string|null\",\n                        \"entryId\": \"string\",\n                        \"termId\": \"string\",\n                        \"rowId\": \"string\",\n                        \"term\": \"string\",\n                        \"translations\": [\n                            { \"lang\": \"German\", \"term\": \"Schraube\" },\n                            { \"lang\": \"English\", \"term\": \"Screw\" }\n                        ]\n                    }\n                ]\n            If plain text is required, the output can be a CSV or tab-delimited format containing the same data.\n\n            When to use this tool:\n                The task explicitly requires crawling or exporting terminologies from MemoQ Web for the \"DASM\" workspace.\n                The user mentions terms, termbases, QTerm, or tbGuid extraction.\n                The result needs materialnummer fields, IDs, and language-specific term mappings.\n\n            Error handling:\n                If workspaceId was not found, return isError: true with a descriptive message.\n                If login fails, return isError: true with \"Authentication failed\" message.\n                If no terms are found, return an empty array in the resource.blob.\n        ", "inputSchema": { "required": ["workspaceId", "username", "password"] } }, "toolInputJson": "{}", "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_2", "name": "Save Result to Gitea Repository", "description": "Save the result from the previous task into the Gitea repository at given path `general/terminology.json`", "repeat": false, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "save_file_contents", "description": "Saves or updates the content of a file in either Github or Gitea, given repository details and authentication.", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } }, "toolInputJson": "{ \"path\": \"general/terminology.json\" }", "inputs": ["action_1"], "output": {} }], "tool": null, "toolInputJson": null, "inputs": [], "output": {} }, "resultLink": "https://gitea-atlascopco-integration.clevernow.com/clevernow/atlascopco-dasm/src/branch/main/flows/examples/crawl-terminology-3baa8b2e973b14837dfa55ca9505c12b.bflow.json", "finishedAt": "2025-08-09T15:35:10.204Z" },
                    bflowviz: { "nodes": [{ "type": "SEQUENCE", "id": "sequence_1", "parentNodeId": null, "name": "Sequence Node", "description": null, "config": null, "tool": null }, { "type": "ACTION", "id": "action_1", "parentNodeId": "sequence_1", "name": "Crawl Terminology Data from MemoQWeb", "description": "Crawl terminology data from MemoQWeb", "config": null, "tool": { "name": "terminologies_crawler", "description": "\n            Description:\n                This tool logs in to the MemoQ Web interface (https://memoq.t-works.eu/memoqweb) for the specified workspace and crawls all available terminologies from its QTerm termbases.\n                It authenticates using the provided username and password, enumerates all termbases available to the user, and for each termbase, retrieves every term entry on every page, including detailed metadata and translations.\n                The collected data is returned as a UTF-8 encoded resource, typically in JSON format.\n\n            Inputs:\n                workspaceId (string) — Identifier of the workspace/termbase group to crawl.\n                username (string) — MemoQ Web username.\n                password (string) — MemoQ Web password.\n\n            Output format (JSON, preferred):\n            json\n                [\n                    {\n                        \"materialnummer\": \"string|null\",\n                        \"entryId\": \"string\",\n                        \"termId\": \"string\",\n                        \"rowId\": \"string\",\n                        \"term\": \"string\",\n                        \"translations\": [\n                            { \"lang\": \"German\", \"term\": \"Schraube\" },\n                            { \"lang\": \"English\", \"term\": \"Screw\" }\n                        ]\n                    }\n                ]\n            If plain text is required, the output can be a CSV or tab-delimited format containing the same data.\n\n            When to use this tool:\n                The task explicitly requires crawling or exporting terminologies from MemoQ Web for the \"DASM\" workspace.\n                The user mentions terms, termbases, QTerm, or tbGuid extraction.\n                The result needs materialnummer fields, IDs, and language-specific term mappings.\n\n            Error handling:\n                If workspaceId was not found, return isError: true with a descriptive message.\n                If login fails, return isError: true with \"Authentication failed\" message.\n                If no terms are found, return an empty array in the resource.blob.\n        ", "inputSchema": { "required": ["workspaceId", "username", "password"] } } }, { "type": "ACTION", "id": "action_2", "parentNodeId": "sequence_1", "name": "Save Result to Gitea Repository", "description": "Save the result from the previous task into the Gitea repository at given path `general/terminology.json`", "config": null, "tool": { "name": "save_file_contents", "description": "Saves or updates the content of a file in either Github or Gitea, given repository details and authentication.", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } } }], "edges": [{ "id": "edge_1", "source": "sequence_1", "target": "action_1" }, { "id": "edge_2", "source": "sequence_1", "target": "action_2" }], "resultLink": "https://gitea-atlascopco-integration.clevernow.com/clevernow/atlascopco-dasm/src/branch/main/flows/examples/crawl-terminology-3baa8b2e973b14837dfa55ca9505c12b.bflowviz.json", "finishedAt": "2025-08-09T15:35:12.394Z" },
                }
            }]
        }
    };
}
