<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import css from '../../app.css?inline';
    import xyflowCss from '@xyflow/svelte/dist/style.css?inline';
	import { CircleX, RefreshCcw } from 'lucide-svelte';
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
	import _ from 'lodash';
	
	let { 
		url = '',
		text = '' 
	} = $props();

	let agentConnection: AgentConnection;
	let monitorAgentMessenger: MonitorAgentMessenger;
	let markdocCustomeElementToBFlowAgentMessenger: MarkdocCustomeElementToBFlowAgentMessenger;
    let bflowToBFlowVizAgentMessenger: BFlowToBFlowVizAgentMessenger;

	let isBFlowBizLoading = $state(true);
	let bflowbizLoadingInfoMessage = $state('');
	let bflowbizLoadingErrorMessage = $state('');
    
	let agents: AgentInfo[] = [];
    let bflowviz: any = $state(null);

	onMount(async() => {
		
		agentConnection = new AgentConnection({name: 'bflow'});

		// SMELL: 
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

		await loadBFlowViz();
		
	});

	onDestroy(async () => {
		try{
			await monitorAgentMessenger.stop();
			await markdocCustomeElementToBFlowAgentMessenger.stop();
			await bflowToBFlowVizAgentMessenger.stop();
			await agentConnection.stop();
		}catch{}
	});

	const loadBFlowViz = async() => {
		isBFlowBizLoading = true;

		await loadAgents();
		const bflow = await convertMarkdocCustomElementToBFlow(url, text);
		if(bflow){
			bflowviz = await convertBFlowToBFlowViz(bflow);
		}
		
		isBFlowBizLoading = false;
		bflowbizLoadingInfoMessage = '';
	}

	const loadAgents = async() => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = 'Loading Agents';

		try{
			const result = await monitorAgentMessenger.request({query: 'list'});
			agents = result?.agents;
		}catch(e: any){
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			console.log('>>>>> Error:', e);
		}finally{
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = '';
		}
	};

	const convertMarkdocCustomElementToBFlow = async(url: string, text: string) => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = 'Convert Markdoc Custom Element to BFlow';
		try{
			const bflowRes = await markdocCustomeElementToBFlowAgentMessenger.request({url, text, agents});
			return bflowRes?.bflow;
		}catch(e: any){
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			return null;
		}finally{
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = '';
		}
	};

	const convertBFlowToBFlowViz = async(bflow: any) => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = 'Convert BFlow to BFlowViz';
		try{
			const bflowvizRes = await bflowToBFlowVizAgentMessenger.request({bflow: bflow});
			addDataPropertyToNodes(bflowvizRes?.bflowViz?.nodes);
			return bflowvizRes?.bflowViz;
		}catch(e: any){
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			return null;
		}finally{
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = '';
		}
	};

	const addDataPropertyToNodes = (nodes: any) => {
		if(nodes && nodes.length > 0){
			_.forEach(nodes, (node: any) => {
				node.data = JSON.parse(JSON.stringify(node));
			});
		}
	}

</script>

<svelte:element this={'style'}>{@html css}</svelte:element>
<svelte:element this={'style'}>{@html xyflowCss}</svelte:element>
{#if isBFlowBizLoading}
	<LoadingIndicator message={bflowbizLoadingInfoMessage}></LoadingIndicator>
{:else if bflowviz}
	<BFlowView data={bflowviz} />
{:else if bflowbizLoadingErrorMessage}
	<div class="h-full w-full flex flex-col items-center justify-center gap-2">
		<CircleX class="text-red-700 w-10 h-10"/>
		<div>{bflowbizLoadingErrorMessage}</div>
	</div>
{:else }
	<div class="h-full w-full flex flex-col items-center justify-center gap-2">
		<div>An error occurred. Please click the refresh button below to try again.</div>
		<button onclick={async () => await loadBFlowViz()}>
			<RefreshCcw class="text-red-700 w-10 h-10"/>
		</button>
	</div>
{/if}