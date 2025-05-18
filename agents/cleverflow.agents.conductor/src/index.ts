import { A2AServer } from '@cleverflow/cleverflow.a2a';
import { handleTask } from './handler';

const PORT = process.env.PORT || 8080;

const server = new A2AServer(handleTask);

server.start(PORT);
console.log('✅ A2A Conductor is listening on port ', PORT);