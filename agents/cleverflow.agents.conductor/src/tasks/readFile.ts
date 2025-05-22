
import { A2AServer, TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.agents/server';
import * as schema from '@cleverflow/cleverflow.agents/schema';
import _ from 'lodash';
import { GUIAgent } from '@cleverflow/cleverflow.core';
import type { GUIAgentInPayload, GUIAgentOutPayload } from '@cleverflow/cleverflow.core';
import * as guiAgent from '../gui/GUIAgent';

export async function* runTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'Working on it...' }]
        }
    };

    // const parts = context.userMessage.parts;
    // const filePart = _.find(parts, (part) => {
    //     return part && part.type === 'file' && 'file' in part;
    // });

    const input = context.task.metadata?.input as any;
    const fileUrl = input?.fileUrl;

    if (fileUrl) {
        console.log('>>> run MCP client to get that file content');
    } else {
        const jsonForm = await guiAgent.getFileUrlForm();
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