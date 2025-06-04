import type { schema, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { convertTextToBFlow } from './tasks/TextToBFlow.js';
import { runBFlow } from './tasks/BFlowRunner.js';
import { convertSchemaToJsonForm } from './tasks/SchemaToJsonForm.js';
import mcpClientManager from './mcp/McpClientManager.js';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

    const taskName = context.task.metadata?.taskName;
    console.log(`Handling task: ${taskName}`);

    switch (taskName) {
        case 'text-to-bflow':
            return yield* convertTextToBFlow(context);
        case 'run-bflow':
            return yield* runBFlow(context);
        case 'schema-to-json-form':
            return yield* convertSchemaToJsonForm(context);
        case 'demo-json-form':
            const toolName = 'fetch-outline-text-file';
            const mcpClient = mcpClientManager.getClientByToolName(toolName);
            const mcpTool = mcpClient.tools.find((tool) => tool.name === toolName);
            yield {
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
            };
            return;
        case 'ping':
            yield {
                state: 'completed',
                message: {
                    role: 'agent',
                    parts: [{
                        type: 'text',
                        text: 'pong'
                    }]
                }
            };
            return;
        default:
            throw new Error(`Unknown task: ${context}`);
    }
}