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
	import { BFLowState } from "./BFlowState.js";

	let { dataProvider, url = "", text = "" } = $props();

	let isBFlowBizLoading = $state(true);
	let bflowbizLoadingInfoMessage = $state("");
	let bflowbizLoadingErrorMessage = $state("");

	onMount(async () => {
		await dataProvider.loadBFlowViz(url, text);
	});

	onDestroy(async () => {});

	// const addDataPropertyToNodes = (nodes: any) => {
	// 	if (nodes && nodes.length > 0) {
	// 		_.forEach(nodes, (node: any) => {
	// 			node.data = JSON.parse(JSON.stringify(node));
	// 			node.position = {
	// 				x: 0,
	// 				y: 0,
	// 			};
	// 			if (node.type === "SEQUENCE") {
	// 				node.dimension = {
	// 					width: 50,
	// 					height: 50,
	// 				};
	// 			} else {
	// 				node.dimension = {
	// 					width: 100,
	// 					height: 50,
	// 				};
	// 			}
	// 		});
	// 	}
	// };

	// function buildTree(nodes: any) {
	// 	if (!nodes) {
	// 		return null;
	// 	}
	// 	const nodeMap = new Map();
	// 	const rootNodes: any = [];

	// 	// Create a map for quick node lookup by ID
	// 	nodes.forEach((node: any) =>
	// 		nodeMap.set(node.id, { ...node, children: [] }),
	// 	);

	// 	// Assign children to their respective parents
	// 	nodes.forEach((node: any) => {
	// 		if (node.parentNodeId !== null) {
	// 			nodeMap
	// 				.get(node.parentNodeId)
	// 				.children.push(nodeMap.get(node.id));
	// 		} else {
	// 			rootNodes.push(nodeMap.get(node.id));
	// 		}
	// 	});

	// 	return rootNodes;
	// }

	// function calculatePositions(
	// 	nodes: any,
	// 	startX = 0,
	// 	startY = 0,
	// 	xGap = 20,
	// 	yGap = 40,
	// ) {
	// 	if (!nodes) {
	// 		return;
	// 	}
	// 	let xOffset = startX;
	// 	let yOffset = startY;

	// 	function layout(node: any, depth = 0) {
	// 		let children = node.children;
	// 		let width = node.dimension.width;
	// 		let height = node.dimension.height;

	// 		// If there are no children, position the node and move right
	// 		if (children.length === 0) {
	// 			node.position.x = xOffset;
	// 			node.position.y = yOffset + depth * (height + yGap);
	// 			xOffset += width + xGap;
	// 			return node.position.x;
	// 		}

	// 		// Position children first
	// 		let childXPositions = children.map((child: any) =>
	// 			layout(child, depth + 1),
	// 		);

	// 		// Center the parent node between its children
	// 		let minX = Math.min(...childXPositions);
	// 		let maxX = Math.max(...childXPositions);
	// 		node.position.x = (minX + maxX) / 2;
	// 		node.position.y = yOffset + depth * (height + yGap);

	// 		return node.position.x;
	// 	}

	// 	nodes.forEach((node: any) => layout(node));
	// }
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>
{#if dataProvider.state !== BFLowState.NONE}
	<LoadingIndicator message={dataProvider.state}></LoadingIndicator>
{:else if dataProvider.bflowviz}
	<BFlowView data={dataProvider.bflowviz} />
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
		<button onclick={async () => await dataProvider.loadBFlowViz()}>
			<RefreshCcw class="text-red-700 w-10 h-10" />
		</button>
	</div>
{/if}
