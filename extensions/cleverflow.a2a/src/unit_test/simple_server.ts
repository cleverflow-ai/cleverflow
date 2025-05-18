import { A2AServer, TaskContext, TaskYieldUpdate, schema } from '../server/index.js';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed

async function* mySimpleHandler(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    console.log('>>> context');
    console.log(JSON.stringify(context, null, 2));
    yield { state: 'working', message: { role: 'agent', parts: [{ type: 'text', text: 'Working on it...' }] } };

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (context.isCancelled()) {
        console.log("Task cancelled!");
        return;
    }

    yield {
        name: 'output.txt',
        parts: [{ type: 'text', text: `Result for task ${context.task.id}` }],
    };

    yield { state: 'completed', message: { role: 'agent', parts: [{ type: 'text', text: 'Done!' }] } };
}

// Create and start the server (e.g., using InMemoryTaskStore)
const server = new A2AServer(mySimpleHandler);
server.start();

console.log("Example server started on port 41241");