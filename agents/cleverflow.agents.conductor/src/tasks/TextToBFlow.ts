import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import mcpClientManager from '../mcp/McpClientManager.js';

export async function* convertTextToBFlow(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'CONVERT_MARKDOC_ELEMENT_TO_BFLOW' }]
        }
    };

    const input = context.task.metadata?.input as any;
    const text = input?.text;

    const bflow = await b.ParseMarkdocBFlowElementToBFlow(
        text,
        mcpClientManager.listTools().map(tool => {
            return {
                name: tool.name,
                description: `Tool ${tool.name} from MCP client`
            };
        }),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'CONVERT_BFLOW_TO_BFLOWVIZ' }]
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
            parts: [{ type: 'text', text: 'CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS' }]
        }
    };

    console.log('bflow');
    console.log(JSON.stringify(bflow, null, 2));
    console.log('bflowViz');
    console.log(JSON.stringify(bflowViz, null, 2));

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