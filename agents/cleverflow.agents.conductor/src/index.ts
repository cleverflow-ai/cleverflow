import { A2AServer } from '@cleverflow/cleverflow.a2a/server';
import { handleTask } from './handler';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenvFlow.config())

const PORT = process.env.PORT || 41241;

const server = new A2AServer(handleTask);

server.start(PORT);
console.log('✅ A2A Conductor is listening on port ', PORT);