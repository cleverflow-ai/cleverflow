<svelte:options customElement="b-flow" />

<script lang="ts">
    import { wsconnect } from "@nats-io/nats-core";

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
            // TODO: Use JsonCodec instead of JSON.stringify!
            // TODO: replace with Request-Reply pattern!
            // See also: https://docs.nats.io/using-nats/developer/sending/request_reply
            // i.e. 
            // await nc.request("time");
            nc.publish('hello', JSON.stringify({ url: url, text: text }));
            console.log(`published`);

            // TODO: close connection right after receiving the reply!
        }
    })();
</script>

<h1>Input (markdoc custom element):</h1>
{{text}}

<h1>Converted to Svelte-Flow-based JSON:</h1>

<slot />