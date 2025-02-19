<svelte:options customElement="b-flow" />

<script lang="ts">
    import { onMount } from 'svelte';
    import styles from '@xyflow/svelte/dist/style.css?inline';
    import { wsconnect } from "@nats-io/nats-core";
    import { JSONCodec } from "nats/lib/nats-base-client/codec.js";
    import BFlowView from "./components/BFlowView.svelte";

    let _isLoading = $state(false);
    const initialNodes = [
		{ 
			id: '1', 
			type: 'ENTRY',
			data: { label: 'entry' }, 
			position: { 
				x: 100, 
				y: 100 
			} 
		},
		{ 
			id: '2', 
			type: 'SEQUENCE',
			position: { 
				x: 0, 
				y: 200 
			} 
		},
		{ 
			id: '3', 
			type: 'ACTION',
			data: {
				id: 'action_1',
				type: 'get-text',
				url: 'https://cleverflow.ai/use-cases/machinery/machines-list.md',
			},
			position: { 
				x: -100, 
				y: 300 
			} 
		},
		{ 
			id: '4', 
			type: 'ACTION',
			data: {
				id: 'action_2',
				type: 'get-bflow',
				url: 'https://cleverflow.ai/use-cases/machinery/machines-selection.md',
			},
			position: { 
				x: 50, 
				y: 300 
			} 
		},
		{ 
			id: '5', 
			type: 'SEQUENCE',
			position: { 
				x: 200, 
				y: 200 
			} 
		},
		{ 
			id: '6', 
			type: 'ACTION',
			data: {
				id: 'action_1',
				type: 'reason-with-bflow',
				instructions: 'Select corresponding Machine Models based on the requested Cake Types and the given Behavior Tree prepare_data.action_2.',
			},
			position: { 
				x: 200, 
				y: 300 
			} 
		},
		{ 
			id: '7', 
			type: 'ACTION',
			data: {
				id: 'action_2',
				type: 'filter',
				instructions: `Use the data from prepare_data.action_1 and select the Machine Models which are given by choose_machine_model.action_1.
                    Filter out the selected Machine Models with the given conditions.
                    If there is no given condition, then we can skip this step.`,
			},
			position: { 
				x: 320, 
				y: 300 
			} 
		},
		{ 
			id: '8', 
			type: 'ACTION',
			data: {
				id: 'action_3',
				type: 'display-table',
			},
			position: { 
				x: 450, 
				y: 300 
			} 
		},
	];
 
  	const initialEdges= [
		{ 
			id: 'e1-2', 
			source: '1', 
			target: '2' 
		},
		{ 
			id: 'e2-3', 
			source: '2', 
			target: '3' 
		},
		{ 
			id: 'e2-4', 
			source: '2', 
			target: '4' 
		},
		{ 
			id: 'e1-5', 
			source: '1', 
			target: '5' 
		},
		{ 
			id: 'e5-6', 
			source: '5', 
			target: '6' 
		},
		{ 
			id: 'e5-7', 
			source: '5', 
			target: '7' 
		},
		{ 
			id: 'e5-8', 
			source: '5', 
			target: '8' 
		}
	];
    let _bflowData: any = $state({
        nodes: initialNodes,
        edges: initialEdges,
    });

    onMount(() => {
        const shadowRoot = document.querySelector('b-flow')?.shadowRoot;
        if (shadowRoot) {
            const styleTag = document.createElement('style');
            styleTag.textContent = styles;
            shadowRoot.appendChild(styleTag);
        }
    });

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

    // (async () => {
    //     const nc = await connectNATS();
    //     if (nc) {
    //         // TODO: Use Strong Type for Message's Data.
    //         const codec = JSONCodec();

    //         // See also: https://docs.nats.io/using-nats/developer/sending/request_reply
    //         const reply = await nc.request(
    //             "hello", 
    //             codec.encode({ url: url, text: text }), 
    //             { 
    //                 timeout: 3600*1000 // 1 hour 
    //             });

    //         _bflowData = codec.decode(reply.data);
    //         _isLoading  = false;
    //         await nc.close();
    //     }
    // })();
</script>
<!-- <svelte:element this={'style'}>{@html xyflowCss}</svelte:element> -->
{#if _isLoading}
    <div>Loading...</div>
{:else}
    {#if _bflowData}
        <BFlowView data={_bflowData} />
    {:else }
        <div>No Data</div>
    {/if}
{/if}
<!-- <h1>Input (markdoc custom element):</h1>
{{text}}

<h1>Converted to Svelte-Flow-based JSON:</h1> -->

<slot />