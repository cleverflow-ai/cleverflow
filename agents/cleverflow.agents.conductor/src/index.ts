import { A2AServer } from '@cleverflow/cleverflow.agents/server';
import { handleTask } from './handler';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
import { getClient } from '@cleverflow/cleverflow.mcp.io.client';

dotenvExpand.expand(dotenvFlow.config())

const rawPort = process.env.PORT;
const PORT = rawPort !== undefined && !isNaN(Number(rawPort)) ? Number(rawPort) : 41241;

const server = new A2AServer(handleTask);

server.start(PORT);

console.log('✅ A2A Conductor is listening on port ', PORT);

(async () => {
    const client = await getClient(process.env.MCP_SERVER_URL);
    // const result = await client.callTool({
    //     name: "calculate-bmi",
    //     arguments: {
    //         weightKg: 70,
    //         heightM: 1.75
    //     }
    // });

    const result = await client.callTool({
        name: "read-outline-file",
        arguments: {
            fileId: 'sealing-technologies-rrOT5m2iSz',
        }
    });

    console.log(result);
})();