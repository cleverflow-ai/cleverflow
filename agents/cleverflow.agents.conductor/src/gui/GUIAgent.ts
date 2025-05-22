
import { GUIAgent } from '@cleverflow/cleverflow.core';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenvFlow.config());

const eventsServer = process.env.EVENTS_SERVER;
const eventsToken = process.env.EVENTS_TOKEN;

const guiAgent = new GUIAgent('GUI');

(async () => {
    await guiAgent.connect({
        servers: eventsServer,
        token: eventsToken
    });
    console.log('>>> gui agent connected to: ', eventsServer, eventsToken);
})();

export const getOutlineFileIdForm = async () => {
    return await guiAgent.request({
        subject: "GUI",
        payload: {
            id: 'file-id-form'
        },
    });
}

