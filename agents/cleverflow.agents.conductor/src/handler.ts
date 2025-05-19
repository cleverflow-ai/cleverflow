
import { TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.a2a/server';
import * as schema from '@cleverflow/cleverflow.a2a/schema';
import * as readFileTask from './tasks/readFile';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    console.log('>>>> context');
    console.log(JSON.stringify(context));
    const taskName = context.task.metadata?.taskName;
    switch (taskName) {
        case 'read-file': {
            return yield* readFileTask.runTask(context);
        }

        default:
            throw new Error(`Unknown task: ${context}`);
    }
}