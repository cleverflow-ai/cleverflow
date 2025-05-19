
import { A2AServer, TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.a2a/server';
import * as schema from '@cleverflow/cleverflow.a2a/schema';
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

    const parts = context.userMessage.parts;
    const filePart = _.find(parts, (part) => {
        return part && part.type === 'file' && 'file' in part;
    });

    if (filePart) {
        console.log('>>> run MCP client to get that file content');
    } else {
        const jsonForm = await guiAgent.getFileUrlForm();
        console.log('>>>>>> jsonForm');
        console.log(jsonForm);
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'data',
                    data: {
                        jsonForm,
                    }
                }]
            }
        };
    }

    console.log('>>>>> onReadFile finished...');
}