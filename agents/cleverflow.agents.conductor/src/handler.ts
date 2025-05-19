
import { A2AServer, TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.a2a/server';
import * as schema from '@cleverflow/cleverflow.a2a/schema';
import _ from 'lodash';

async function* onReadFile(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
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
        console.log('>>> request a GUI to allow user enter that file url');
    }

    console.log('>>>>> onReadFile finished...');
}

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    console.log('>>>> context');
    console.log(JSON.stringify(context));
    const taskName = context.task.metadata?.taskName;
    switch (taskName) {
        case 'read-file': {
            return yield* onReadFile(context);
        }

        default:
            throw new Error(`Unknown task: ${context}`);
    }
}