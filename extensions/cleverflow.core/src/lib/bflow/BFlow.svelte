<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import css from "../../app.css?inline";
	import xyflowCss from "@xyflow/svelte/dist/style.css?inline";
	import { CircleX, RefreshCcw } from "lucide-svelte";
	import BFlowView from "./visualization/BFlowView.svelte";
	// SMELL: This is a workaround to make TailwindCSS work in the web component.
	// IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
	import Tailwindcss from "../common/components/Tailwindcss.svelte";
	import LoadingIndicator from "../common/components/LoadingIndicator.svelte";
	import AgentConnection from "../common/agent/AgentConnection.js";
	import MonitorAgentMessenger from "../common/agent/MonitorAgentMessenger.js";
	import MarkdocCustomeElementToBFlowAgentMessenger from "./agent/MarkdocCustomeElementToBFlowAgentMessenger.js";
	import BFlowToBFlowVizAgentMessenger from "./agent/BFlowToBFlowVizAgentMessenger.js";
	import type AgentInfo from "$lib/common/agent/AgentInfo.js";
	import _ from "lodash";

	let { url = "", text = "" } = $props();

	let agentConnection: AgentConnection;
	let monitorAgentMessenger: MonitorAgentMessenger;
	let markdocCustomeElementToBFlowAgentMessenger: MarkdocCustomeElementToBFlowAgentMessenger;
	let bflowToBFlowVizAgentMessenger: BFlowToBFlowVizAgentMessenger;

	let isBFlowBizLoading = $state(true);
	let bflowbizLoadingInfoMessage = $state("");
	let bflowbizLoadingErrorMessage = $state("");

	let agents: AgentInfo[] = [];
	let bflowviz: any = $state(null);

	onMount(async () => {
		agentConnection = new AgentConnection({ name: "bflow" });

		// SMELL:
		await agentConnection.connect({
			servers: "ws://localhost:8080",
			token: "76de3ba222bec3af21f9dbfb01f3197b",
		});

		monitorAgentMessenger = new MonitorAgentMessenger({
			connection: agentConnection,
		});

		markdocCustomeElementToBFlowAgentMessenger =
			new MarkdocCustomeElementToBFlowAgentMessenger({
				connection: agentConnection,
			});
		bflowToBFlowVizAgentMessenger = new BFlowToBFlowVizAgentMessenger({
			connection: agentConnection,
		});

		await loadBFlowViz();
	});

	onDestroy(async () => {
		try {
			await monitorAgentMessenger.stop();
			await markdocCustomeElementToBFlowAgentMessenger.stop();
			await bflowToBFlowVizAgentMessenger.stop();
			await agentConnection.stop();
		} catch {}
	});

	const loadBFlowViz = async () => {
		isBFlowBizLoading = true;

		await loadAgents();
		const bflow = await convertMarkdocCustomElementToBFlow(url, text);
		if (bflow) {
			bflowviz = await convertBFlowToBFlowViz(bflow);
		}

		isBFlowBizLoading = false;
		bflowbizLoadingInfoMessage = "";
	};

	const loadAgents = async () => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = "Loading Agents";

		try {
			const result = await monitorAgentMessenger.request({
				query: "list",
			});
			agents = result?.agents;
		} catch (e: any) {
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			console.log(">>>>> Error:", e);
		} finally {
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = "";
		}
	};

	const convertMarkdocCustomElementToBFlow = async (
		url: string,
		text: string,
	) => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = "Convert Markdoc Custom Element to BFlow";
		try {
			const bflowRes =
				await markdocCustomeElementToBFlowAgentMessenger.request({
					url,
					text,
					agents,
				});
			return bflowRes?.bflow;
		} catch (e: any) {
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			return null;
		} finally {
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = "";
		}
	};

	const convertBFlowToBFlowViz = async (bflow: any) => {
		isBFlowBizLoading = true;
		bflowbizLoadingInfoMessage = "Convert BFlow to BFlowViz";
		try {
			const bflowvizRes = await bflowToBFlowVizAgentMessenger.request({
				bflow: bflow,
			});
			addDataPropertyToNodes(bflowvizRes?.bflowViz?.nodes);
			// Build tree and calculate positions
			const tree = buildTree(bflowvizRes?.bflowViz?.nodes);
			calculatePositions(tree);
			// console.log(JSON.stringify(bflowvizRes?.bflowViz?.edges));
			// console.log(JSON.stringify(bflowvizRes?.bflowViz?.nodes));
			return bflowvizRes?.bflowViz;
		} catch (e: any) {
			console.error(e);
			isBFlowBizLoading = false;
			bflowbizLoadingErrorMessage = e.message;
			return null;
		} finally {
			isBFlowBizLoading = false;
			bflowbizLoadingInfoMessage = "";
		}
	};

	const addDataPropertyToNodes = (nodes: any) => {
		if (nodes && nodes.length > 0) {
			_.forEach(nodes, (node: any) => {
				node.data = JSON.parse(JSON.stringify(node));
				node.position = {
					x: 0,
					y: 0,
				};
				if (node.type === "SEQUENCE") {
					node.dimension = {
						width: 50,
						height: 50,
					};
				} else {
					node.dimension = {
						width: 100,
						height: 50,
					};
				}
			});
		}
	};

	function buildTree(nodes: any) {
		if (!nodes) {
			return null;
		}
		const nodeMap = new Map();
		const rootNodes: any = [];

		// Create a map for quick node lookup by ID
		nodes.forEach((node: any) =>
			nodeMap.set(node.id, { ...node, children: [] }),
		);

		// Assign children to their respective parents
		nodes.forEach((node: any) => {
			if (node.parentNodeId !== null) {
				nodeMap
					.get(node.parentNodeId)
					.children.push(nodeMap.get(node.id));
			} else {
				rootNodes.push(nodeMap.get(node.id));
			}
		});

		return rootNodes;
	}

	function calculatePositions(
		nodes: any,
		startX = 0,
		startY = 0,
		xGap = 20,
		yGap = 40,
	) {
		if (!nodes) {
			return;
		}
		let xOffset = startX;
		let yOffset = startY;

		function layout(node: any, depth = 0) {
			let children = node.children;
			let width = node.dimension.width;
			let height = node.dimension.height;

			// If there are no children, position the node and move right
			if (children.length === 0) {
				node.position.x = xOffset;
				node.position.y = yOffset + depth * (height + yGap);
				xOffset += width + xGap;
				return node.position.x;
			}

			// Position children first
			let childXPositions = children.map((child: any) =>
				layout(child, depth + 1),
			);

			// Center the parent node between its children
			let minX = Math.min(...childXPositions);
			let maxX = Math.max(...childXPositions);
			node.position.x = (minX + maxX) / 2;
			node.position.y = yOffset + depth * (height + yGap);

			return node.position.x;
		}

		nodes.forEach((node: any) => layout(node));
	}
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>
{#if isBFlowBizLoading}
	<LoadingIndicator message={bflowbizLoadingInfoMessage}></LoadingIndicator>
{:else if bflowviz}
	<BFlowView data={bflowviz} />
{:else if bflowbizLoadingErrorMessage}
	<div class="h-full w-full flex flex-col items-center justify-center gap-2">
		<CircleX class="text-red-700 w-10 h-10" />
		<div>{bflowbizLoadingErrorMessage}</div>
	</div>
{:else}
	<div class="h-full w-full flex flex-col items-center justify-center gap-2">
		<div>
			An error occurred. Please click the refresh button below to try
			again.
		</div>
		<button onclick={async () => await loadBFlowViz()}>
			<RefreshCcw class="text-red-700 w-10 h-10" />
		</button>
	</div>
{/if}
