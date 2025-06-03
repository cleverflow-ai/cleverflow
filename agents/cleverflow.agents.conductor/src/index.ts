import { A2AServer } from '@cleverflow-ai/cleverflow.agents/server';
import { handleTask } from './Handler.js';
import { registerAllMcpClients } from './mcp/Setup.js';

import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenvFlow.config());

console.log('>>>> Environment Variables');
console.log(JSON.stringify(process.env, null, 2));

(async () => {
    await registerAllMcpClients();

    const rawPort = process.env.PORT;
    const PORT = rawPort !== undefined && !isNaN(Number(rawPort)) ? Number(rawPort) : 41241;

    const server = new A2AServer(handleTask);

    server.start(PORT);

    console.log('✅ A2A Conductor is listening on port ', PORT);
})();