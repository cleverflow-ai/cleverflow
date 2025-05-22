import { A2AServer } from '@cleverflow/cleverflow.agents/server';
import { handleTask } from './handler';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenvFlow.config())

const rawPort = process.env.PORT;
const PORT = rawPort !== undefined && !isNaN(Number(rawPort)) ? Number(rawPort) : 41241;

const server = new A2AServer(handleTask);

server.start(PORT);

console.log('✅ A2A Conductor is listening on port ', PORT);