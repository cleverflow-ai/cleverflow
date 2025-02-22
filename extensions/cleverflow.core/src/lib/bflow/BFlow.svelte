<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onMount } from 'svelte';
	import css from '../../app.css?inline';
    import xyflowCss from '@xyflow/svelte/dist/style.css?inline';
	import { CircleX } from 'lucide-svelte';
    import BFlowView from "./visualization/BFlowView.svelte";
	// SMELL: This is a workaround to make TailwindCSS work in the web component.
	// IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
	import Tailwindcss from '../common/components/Tailwindcss.svelte';
	import LoadingIndicator from '../common/components/LoadingIndicator.svelte';
	import AgentConnection from '../common/agent/AgentConnection.js';
	import MonitorAgentMessenger from '../common/agent/MonitorAgentMessenger.js';
	import MarkdocCustomeElementToBFlowAgentMessenger from './agent/MarkdocCustomeElementToBFlowAgentMessenger.js';
	import BFlowToBFlowVizAgentMessenger from './agent/BFlowToBFlowVizAgentMessenger.js';
    import type AgentInfo from '$lib/common/agent/AgentInfo.js';
	
	let { 
		url = '',
		text = '' 
	} = $props();

	let agentConnection: AgentConnection;
	let monitorAgentMessenger: MonitorAgentMessenger;
	let markdocCustomeElementToBFlowAgentMessenger: MarkdocCustomeElementToBFlowAgentMessenger;
    let bflowToBFlowVizAgentMessenger: BFlowToBFlowVizAgentMessenger;

	let isLoading = $state(true);
	let loadingMessage = $state('');
	let errorMessage = $state('');
    
	let agents: AgentInfo[] = [];
    let bflowviz: any = $state(null);

	onMount(async() => {
		
		agentConnection = new AgentConnection({name: 'bflow'});

		await agentConnection.connect({
			servers: 'ws://localhost:8080',
			token: '76de3ba222bec3af21f9dbfb01f3197b'
		});

		monitorAgentMessenger = new MonitorAgentMessenger({
			connection: agentConnection,
		});
		
		markdocCustomeElementToBFlowAgentMessenger = new MarkdocCustomeElementToBFlowAgentMessenger({
			connection: agentConnection,
		});
		bflowToBFlowVizAgentMessenger = new BFlowToBFlowVizAgentMessenger({
			connection: agentConnection,
		});

		await loadAgents();
		const bflow = await convertMarkdocCustomElementToBFlow(url, text);
		if(bflow){
			bflowviz = await convertBFlowToBFlowViz(bflow);
		}
		
		isLoading = false;
		loadingMessage = '';
		await agentConnection.stop();
	});

	const loadAgents = async() => {
		try{
			loadingMessage = 'Loading Agents';
			const result = await monitorAgentMessenger.request({query: 'list'});
			agents = result.agents;
		}catch(e: any){
			console.error(e);
			isLoading = false;
			errorMessage = e.message;
			console.log('>>>>> Error:', e);
		}finally{
			isLoading = false;
			loadingMessage = '';
		}
	};

	const convertMarkdocCustomElementToBFlow = async(url: string, text: string) => {
		try{
			loadingMessage = 'Convert Markdoc Custom Element to BFlow';
			const bflowRes = await markdocCustomeElementToBFlowAgentMessenger.request({url, text, agents});
			return bflowRes.bflow;
		}catch(e: any){
			console.error(e);
			isLoading = false;
			errorMessage = e.message;
			return null;
		}finally{
			isLoading = false;
			loadingMessage = '';
		}
	};

	const convertBFlowToBFlowViz = async(bflow: any) => {
		try{
			loadingMessage = 'Convert BFlow to BFlowViz';
			const bflowvizRes = await bflowToBFlowVizAgentMessenger.request({bflow: bflow});
			return bflowvizRes.bflowViz;
		}catch(e: any){
			console.error(e);
			isLoading = false;
			errorMessage = e.message;
			return null;
		}finally{
			isLoading = false;
			loadingMessage = '';
		}
	};

</script>

<svelte:element this={'style'}>{@html css}</svelte:element>
<svelte:element this={'style'}>{@html xyflowCss}</svelte:element>
{#if isLoading}
	<LoadingIndicator message={loadingMessage}></LoadingIndicator>
{:else if bflowviz}
	<BFlowView data={bflowviz} />
{:else if errorMessage}
	<div class="h-full w-full flex flex-col items-center justify-center gap-2">
		<CircleX class="text-red-700 w-10 h-10"/>
		<div>{errorMessage}</div>
	</div>
{:else }
	<div>No Data</div>
{/if}