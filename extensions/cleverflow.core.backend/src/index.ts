import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { connect } from "@nats-io/transport-node";

import { b } from "./baml_client/async_client.js";
import type { BFlow } from "./baml_client/types.js";
import { ClientRegistry } from '@boundaryml/baml';

const clients = new ClientRegistry();
clients.addLlmClient(
    'Ollama_Default', 
    'openai-generic', 
    {
        base_url: 'http://57.128.86.248:11434/v1',
        api_key: 'ollama',
        model:'gemma2:latest' ,
        temperature: 0,
    }
);
clients.setPrimary('Ollama_Default');

const nc = await connect({
    servers: 'localhost:4222',
    token: '76de3ba222bec3af21f9dbfb01f3197b'
});
console.log(`connected`);

const codec = JSONCodec();

const subscription = nc.subscribe("hello",  {
    callback: (_err, msg) => {
        const data = codec.decode(msg.data);
        console.log(`received: ${JSON.stringify(data)}`);

        parse(data).then((result) => {;
            msg.respond(codec.encode(result));

            console.log(`responded already.`);
        });
    },
});

async function parse(data: any): Promise<BFlow> {
    const response = await b.ParseMarkdocBFlowElementToBFlow(data.text, { clientRegistry: clients });
    console.log(response);

    return response;
}
