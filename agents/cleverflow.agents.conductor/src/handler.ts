
import { A2AServer, TaskContext, TaskYieldUpdate, schema } from '@cleverflow/cleverflow.a2a';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    switch (context.taskName) {
        case 'read-file': {
            return;
        }

        default:
            throw new Error(`Unknown task: ${context.taskName}`);
    }
}