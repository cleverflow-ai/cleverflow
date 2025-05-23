import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { CFGUIAgent } from '$lib/agents/GUIAgent';
import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenvFlow.config());

const handleParaglide: Handle = i18n.handle();

// export const handle: Handle = handleParaglide;

let GUIAgentStarted = false;

async function startGUIAgent() {

    if (GUIAgentStarted) return;

    GUIAgentStarted = true;

    const eventsServer = process.env.EVENTS_SERVER;
    const eventsToken = process.env.EVENTS_TOKEN;

    const guiAgent = new CFGUIAgent('GUI');
    await guiAgent.connect({
        servers: eventsServer,
        token: eventsToken
    });

    guiAgent.subscribe("GUI");

    console.log(`>>>> GUI Agent started...`);
}

export const handle: Handle = async ({ event, resolve }) => {
    // await startGUIAgent(); // start once on first request
    return handleParaglide({ event, resolve });
};