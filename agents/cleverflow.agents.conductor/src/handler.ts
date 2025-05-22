
import { TaskContext, TaskYieldUpdate } from '@cleverflow/cleverflow.agents/server';
import * as schema from '@cleverflow/cleverflow.agents/schema';
import * as readFileTask from './tasks/getOutlineFile';

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