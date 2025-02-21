<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onMount } from 'svelte';
	import css from '../../app.css?inline';
    import xyflowCss from '@xyflow/svelte/dist/style.css?inline';
    import BFlowView from "./visualization/BFlowView.svelte";
	// SMELL: This is a workaround to make TailwindCSS work in the web component.
	// IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
	import Tailwindcss from './Tailwindcss.svelte';
	import LoadingIndicator from '../common/components/LoadingIndicator.svelte';
	import AgentConnection from '../common/agent/AgentConnection.js';
	import MarkdocCustomeElementToBFlowAgentMessenger from './agent/MarkdocCustomeElementToBFlowAgentMessenger.js';
	import BFlowToBFlowVizAgentMessenger from './agent/BFlowToBFlowVizAgentMessenger.js';
	let { 
		url = '',
		text = '' 
	} = $props();

	let agentConnection: AgentConnection | null = null;
	let markdocCustomeElementToBFlowAgentMessenger: MarkdocCustomeElementToBFlowAgentMessenger | null = null;
    let bflowToBFlowVizAgentMessenger: BFlowToBFlowVizAgentMessenger | null = null;

	let isLoading = $state(true);
	let loadingMessage = $state('');

    const initialNodes = [
			{
				"type": "SEQUENCE",
				"id": "prepare_data",
				"name": null,
				"description": null,
				"parentId": null,
				"config": null,
				"position": {
					"x": 0,
					"y": 0
				}
			},
			{
				"type": "ACTION",
				"id": "action_1",
				"name": "get-text",
				"data": {
					"name": "get-text",
				},
				"description": "1. Getting List of all Machine Models and corresponding Infos.",
				"parentId": "prepare_data",
				"config": {
					"yaml": "url: https://cleverflow.ai/use-cases/machinery/machines-list.md"
				},
				"position": {
					"x": 0,
					"y": 150
				}
			},
			{
				"type": "ACTION",
				"id": "action_2",
				"name": "get-bflow",
				"description": "2. Converting Selection Logic to a Behavioral Flow to both \nenable AI-based Decision Making, \nand explain the Choices made to Human.",
				"parentId": "prepare_data",
				"config": {
					"yaml": "url: https://cleverflow.ai/use-cases/machinery/machines-selection.md"
				},
				"position": {
					"x": 0,
					"y": 300
				}
			}
		];
 
  	const initialEdges= [
			{
				"id": 1,
				"source": "prepare_data",
				"target": "action_1"
			},
			{
				"id": 2,
				"source": "prepare_data",
				"target": "action_2"
			}
		];
    let bflowviz: any = $state({
        nodes: [],
        edges: [],
    });

	onMount(async() => {
		agentConnection = new AgentConnection({name: 'bflow'});
		await agentConnection.connect({
			servers: 'ws://localhost:8080',
			token: '76de3ba222bec3af21f9dbfb01f3197b'
		});
		
		markdocCustomeElementToBFlowAgentMessenger = new MarkdocCustomeElementToBFlowAgentMessenger({
			connection: agentConnection,
		});
		bflowToBFlowVizAgentMessenger = new BFlowToBFlowVizAgentMessenger({
			connection: agentConnection,
		});

		loadingMessage = 'Convert markdoc custom element to BFlow';
		const bflowRes = await markdocCustomeElementToBFlowAgentMessenger.request({url: url, text: text});
		
		loadingMessage = 'Convert BFlow to BFlowViz';
		const bflowvizRes = await bflowToBFlowVizAgentMessenger.request({bflow: bflowRes.bflow});

		bflowviz = bflowvizRes.bflowViz;

		isLoading = false;
		loadingMessage = '';
		await agentConnection.stop();
	});


</script>

<svelte:element this={'style'}>{@html css}</svelte:element>
<svelte:element this={'style'}>{@html xyflowCss}</svelte:element>
{#if isLoading}
	<LoadingIndicator message={loadingMessage}></LoadingIndicator>
{:else if bflowviz}
	<BFlowView data={bflowviz} />
{:else }
	<div>No Data</div>
{/if}