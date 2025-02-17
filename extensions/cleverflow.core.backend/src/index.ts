import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { connect } from "@nats-io/transport-node";

const nc = await connect({ 
    servers: 'localhost:4222',
    token: '76de3ba222bec3af21f9dbfb01f3197b'
});
console.log(`connected`);

const codec = JSONCodec();

const subscription = nc.subscribe("hello", {
    callback: (_err, msg) => {
        const data = codec.decode(msg.data);
        console.log(`received: ${JSON.stringify(data)}`);

        const result = data;
        msg.respond(codec.encode(result));

        console.log(`responded already.`);
    },
});