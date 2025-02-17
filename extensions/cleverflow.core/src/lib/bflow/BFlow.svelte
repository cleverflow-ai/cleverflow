<svelte:options customElement="b-flow" />

<script lang="ts">
    import { wsconnect } from "@nats-io/nats-core";
    import { JSONCodec } from "nats/lib/nats-base-client/codec.js";

    async function connectNATS() {
        
        try {
            // We must insert the correct protocol 'ws',
            // as the Server is now set without TLS.
            const nc = await wsconnect({ 
                servers: 'ws://localhost:8080',
                token: '76de3ba222bec3af21f9dbfb01f3197b'
            });

            console.log(`connected`);
            return nc;
        } catch (error) {
            console.error(`Error connecting to NATS: ${error}`);
            return null;
        }
    }
    
    let { 
        url = '',
        text = '' 
    } = $props();

    (async () => {
        const nc = await connectNATS();
        if (nc) {
            // TODO: Use Strong Type for Message's Data.
            const codec = JSONCodec();

            // See also: https://docs.nats.io/using-nats/developer/sending/request_reply
            const reply = await nc.request("hello", codec.encode({ url: url, text: text }));

            const repliedData = codec.decode(reply.data);
            console.log(`received decoded Reply: ${ JSON.stringify(repliedData)}`);

            await nc.close();
        }
    })();
</script>

<h1>Input (markdoc custom element):</h1>
{{text}}

<h1>Converted to Svelte-Flow-based JSON:</h1>

<slot />