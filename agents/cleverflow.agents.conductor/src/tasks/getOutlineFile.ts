
import { TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.agents/server';
import * as schema from '@cleverflow/cleverflow.agents/schema';
import _ from 'lodash';
import * as guiAgent from '../gui/GUIAgent';
import { getClient } from '@cleverflow/cleverflow.mcp.io.client';

export async function* runTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'Working on it...' }]
        }
    };

    const input = context.task.metadata?.input as any;
    const fileId = input?.fileId;

    if (fileId) {
        const client = await getClient(process.env.MCP_SERVER_URL);
        const result = await client.callTool({
            name: "read-outline-file",
            arguments: {
                fileId
            }
        });

        const content = result.content;
        const text = content && Array.isArray(content) && content.length > 0 ? content[0].text : null;

        yield {
            state: 'completed',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: text
                }]
            }
        };
    } else {
        const jsonForm = await guiAgent.getOutlineFileIdForm();
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'data',
                    data: jsonForm
                }],
                metadata: context.task.metadata
            }
        };
    }

    console.log('>>>>> onReadFile finished...');
}