import FileUploaderAgent from './FileUploaderAgent.js';
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

const eventsServer = process.env.EVENTS_SERVER;
const eventsToken = process.env.EVENTS_TOKEN;

const fileUploaderAgent = new FileUploaderAgent();

await fileUploaderAgent.run({
    servers: eventsServer,
    token: eventsToken
});

await fileUploaderAgent.register();