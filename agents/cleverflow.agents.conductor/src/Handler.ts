import type { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import type { Task } from '@cleverflow-ai/cleverflow.agents/schema';
import { convertTextToBFlow } from './tasks/TextToBFlow.js';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
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