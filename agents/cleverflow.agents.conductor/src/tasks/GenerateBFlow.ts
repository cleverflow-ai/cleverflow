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
                    bflow: { "id": "analyze-selling-products-flow", "name": "Analyze Selling Products Flow", "description": "", "root": { "type": "SEQUENCE", "id": "sequence_1", "name": "Sequence Node", "description": "", "repeat": null, "prompt": null, "config": null, "state": null, "stateMessage": null, "goto": [{ "type": "ACTION", "id": "action_1", "name": "Extract File Paths", "description": "Extract all file paths matching the pattern: orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/*.pdf", "repeat": null, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "list_repository_files", "description": "Tool list_repository_files from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "pattern"] } }, "toolInput": "{ \"pattern\": \"orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/*.pdf\" }", "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_2", "name": "Analyze File Paths", "description": "Analyze File Paths.\n\nWrite a JavaScript function that takes an array of file paths that come from the previous action node. Each path follows this pattern:\norders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/{fileName}.pdf\n\nThe function should:\nUse a regular expression with 5 capture groups to extract:\norderNumber (string)\npositionInOrder (number)\nlanguage (string)\nproductVariant (string)\nfileName (string, without .pdf)\nIgnore paths that do not match the pattern.\nReturn an array of extracted objects.", "repeat": null, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "execute_js", "description": "Tool execute_js from MCP client", "inputSchema": { "required": ["jsCode"] } }, "toolInput": "", "inputs": ["action_1"], "output": {} }, { "type": "ACTION", "id": "action_3", "name": "Fetch Excel File Content", "description": "Fetch the content of an Excel file from Gitea located at `general/ENSOTypenschlüssel.xlsx`.", "repeat": null, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "get_file_contents", "description": "Tool get_file_contents from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } }, "toolInput": "{ \"path\": \"general/ENSOTypenschlüssel.xlsx\" }", "inputs": [], "output": {} }, { "type": "ACTION", "id": "action_4", "name": "Convert Excel to Text", "description": "Convert the Excel content from the action node with `id=\"action_3`\" to plain text.", "repeat": null, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "convert_doc_files_into_text_chunks", "description": "Tool convert_doc_files_into_text_chunks from MCP client", "inputSchema": { "required": ["payloads"] } }, "toolInput": "{ \"payloads\": [\"action_3\"] }", "inputs": ["action_3"], "output": {} }, { "type": "ACTION", "id": "action_5", "name": "Prepare Product Variant Data", "description": "Prepare product variant data. Take the `productVariants` array from the action node with `id=\"action_2\"` and the explanation string from the action node with `id=\"action_4\"`.\n\nYour task is to write a JavaScript code snippet that does only the following:\n- `data[0]` is an array of product variants.\n- `data[1]` is a string explanation.\n- Create a new array named `mapped`, where each element is an object in the format `{ productVariant: <variant>, explanation: <explanation> }`.\n- Return `mapped` at the end.\n\nOutput only the function body (no function declaration, IIFE, or `console.log`).", "repeat": null, "prompt": false, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "execute_js", "description": "Tool execute_js from MCP client", "inputSchema": { "required": ["jsCode"] } }, "toolInput": "", "inputs": ["action_2", "action_4"], "output": {} }, { "type": "ACTION", "id": "action_6", "name": "Analyze Selling Products", "description": "Analyze selling Products. Take the data list from the action node with `id=\"action_5\"`.\n\nPrompt:\nUsing the information provided in explanation, which describes the structure and meaning of each token in a product designation, extract all relevant product features from the following type key: productVariant.\n\nReturn the result as a structured list showing:\nThe name of each feature\nThe corresponding value from productVariant\nA short interpretation based on explanation\n\nIf any token is unclear or undefined in explanation, label it as \"unspecified\" and note that interpretation is not available. Ensure output is complete, concise, and aligns with the explanation logic.", "repeat": true, "prompt": true, "config": null, "state": null, "stateMessage": null, "goto": [], "tool": { "name": "execute_prompt", "description": "Executes a natural language prompt using a Large Language Model (LLM)", "inputSchema": { "required": [] } }, "toolInput": "", "inputs": ["action_5"], "output": {} }], "tool": null, "toolInput": null, "inputs": null, "output": null } },
                    bflowviz: { "nodes": [{ "type": "SEQUENCE", "id": "sequence_1", "parentNodeId": null, "name": "Sequence Node", "description": "", "config": null, "tool": null }, { "type": "ACTION", "id": "action_1", "parentNodeId": "sequence_1", "name": "Extract File Paths", "description": "Extract all file paths matching the pattern: orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/*.pdf", "config": null, "tool": { "name": "list_repository_files", "description": "Tool list_repository_files from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "pattern"] } } }, { "type": "ACTION", "id": "action_2", "parentNodeId": "sequence_1", "name": "Analyze File Paths", "description": "Analyze File Paths.\n\nWrite a JavaScript function that takes an array of file paths that come from the previous action node. Each path follows this pattern:\norders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/{fileName}.pdf\n\nThe function should:\nUse a regular expression with 5 capture groups to extract:\norderNumber (string)\npositionInOrder (number)\nlanguage (string)\nproductVariant (string)\nfileName (string, without .pdf)\nIgnore paths that do not match the pattern.\nReturn an array of extracted objects.", "config": null, "tool": { "name": "execute_js", "description": "Tool execute_js from MCP client", "inputSchema": { "required": ["jsCode"] } } }, { "type": "ACTION", "id": "action_3", "parentNodeId": "sequence_1", "name": "Fetch Excel File Content", "description": "Fetch the content of an Excel file from Gitea located at `general/ENSOTypenschlüssel.xlsx`.", "config": null, "tool": { "name": "get_file_contents", "description": "Tool get_file_contents from MCP client", "inputSchema": { "required": ["url", "token", "branch", "owner", "repo", "path"] } } }, { "type": "ACTION", "id": "action_4", "parentNodeId": "sequence_1", "name": "Convert Excel to Text", "description": "Convert the Excel content from the action node with `id=\"action_3`\" to plain text.", "config": null, "tool": { "name": "convert_doc_files_into_text_chunks", "description": "Tool convert_doc_files_into_text_chunks from MCP client", "inputSchema": { "required": ["payloads"] } } }, { "type": "ACTION", "id": "action_5", "parentNodeId": "sequence_1", "name": "Prepare Product Variant Data", "description": "Prepare product variant data. Take the `productVariants` array from the action node with `id=\"action_2\"` and the explanation string from the action node with `id=\"action_4\"`.\n\nYour task is to write a JavaScript code snippet that does only the following:\n- `data[0]` is an array of product variants.\n- `data[1]` is a string explanation.\n- Create a new array named `mapped`, where each element is an object in the format `{ productVariant: <variant>, explanation: <explanation> }`.\n- Return `mapped` at the end.\n\nOutput only the function body (no function declaration, IIFE, or `console.log`).", "config": null, "tool": { "name": "execute_js", "description": "Tool execute_js from MCP client", "inputSchema": { "required": ["jsCode"] } } }, { "type": "ACTION", "id": "action_6", "parentNodeId": "sequence_1", "name": "Analyze Selling Products", "description": "Analyze selling Products. Take the data list from the action node with `id=\"action_5\"`.\n\nPrompt:\nUsing the information provided in explanation, which describes the structure and meaning of each token in a product designation, extract all relevant product features from the following type key: productVariant.\n\nReturn the result as a structured list showing:\nThe name of each feature\nThe corresponding value from productVariant\nA short interpretation based on explanation\n\nIf any token is unclear or undefined in explanation, label it as \"unspecified\" and note that interpretation is not available. Ensure output is complete, concise, and aligns with the explanation logic.", "config": null, "tool": { "name": "execute_prompt", "description": "Executes a natural language prompt using a Large Language Model (LLM)", "inputSchema": { "required": [] } } }], "edges": [{ "id": "edge_1", "source": "sequence_1", "target": "action_1" }, { "id": "edge_2", "source": "sequence_1", "target": "action_2" }, { "id": "edge_3", "source": "sequence_1", "target": "action_3" }, { "id": "edge_4", "source": "sequence_1", "target": "action_4" }, { "id": "edge_5", "source": "sequence_1", "target": "action_5" }, { "id": "edge_6", "source": "sequence_1", "target": "action_6" }] }
                }
            }]
        }
    };
}
