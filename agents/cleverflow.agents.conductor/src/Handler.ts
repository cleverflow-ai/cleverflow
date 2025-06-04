import type { schema, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { convertTextToBFlow } from './tasks/TextToBFlow.js';
import { runBFlow } from './tasks/BFlowRunner.js';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    // console.log('>>>> context');
    // console.log(JSON.stringify(context));

    const taskName = context.task.metadata?.taskName;
    console.log(`Handling task: ${taskName}`);

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
        case 'run-bflow':
            return yield* runBFlow(context);
        default:
            throw new Error(`Unknown task: ${context}`);
    }
}