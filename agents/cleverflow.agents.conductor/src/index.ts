import { A2AServer, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import { convertTextToBFlow } from './tasks/TextToBFlow.js';

import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenvFlow.config())

console.log('>>>> Environment Variables');
console.log(JSON.stringify(process.env, null, 2));

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
        case 'text-to-bflow':
            return yield* convertTextToBFlow(context);
        default:
            throw new Error(`Unknown task: ${context}`);
    }
}