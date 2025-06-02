import { A2AServer, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/dist/server.js';
import * as schema from '@cleverflow-ai/cleverflow.agents/dist/schema.js';
import { fetchOutlineFile } from './tasks/FetchOutlineFile.js';

import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenvFlow.config())

const rawPort = process.env.PORT;
const PORT = rawPort !== undefined && !isNaN(Number(rawPort)) ? Number(rawPort) : 41241;

const server = new A2AServer(handleTask);

server.start(PORT);

console.log('✅ A2A Conductor is listening on port ', PORT);

async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    console.log('>>>> context');
    console.log(JSON.stringify(context));

    const taskName = context.task.metadata?.taskName;

    switch (taskName) {
        case 'read-file': {
            return yield* fetchOutlineFile(context);
        }

        default:
            throw new Error(`Unknown task: ${context}`);
    }
}