<script lang="ts">
	import { SvelteFlow, Controls, Background } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";
	import { writable } from "svelte/store";
	import EntryNode from "./EntryNode.svelte";
	import SequenceNode from "./SequenceNode.svelte";
	import ActionNode from "./ActionNode.svelte";
	import { onDestroy, onMount } from "svelte";
	import postal from "postal";
	import {
		addToast,
		ToastType,
	} from "../../common/components/toast/ToastStore.js";
	import Drawer from "../../common/components/Drawer.svelte";
	import RunNodeResult from "./RunNodeResult.svelte";
	import _ from "lodash";
	import { BFlowNodeState } from "../agent/models/BFlowNodeState.js";

	const channel = postal.channel("b-flow-view");

	const { bflowRunResult, bflowviz } = $props();

	const nodeTypes = {
		ENTRY: EntryNode,
		SEQUENCE: SequenceNode,
		ACTION: ActionNode,
	};

	let isInitialize = $state(false);
	let nodes = $state(writable([]));
	let edges = $state(writable([]));

	let drawerElement: any = $state();

	let runNodeResult: any = $state(null);

	const showRunNodeResultSubscriber = channel.subscribe(
		"show-run-node-result",
		(payload: any) => {
			showRunNodeResult(payload.id);
		},
	);

	onMount(() => {
		_.forEach(bflowviz.edges, (edge: any) => {
			edge.animated = false;
		});
		const runningNode = _.find(bflowviz.nodes, (node: any) => {
			return node?.data?.state === BFlowNodeState.RUNNING;
		});
		if (runningNode) {
			const edge = _.find(bflowviz.edges, (edge: any) => {
				return (
					edge.source === runningNode.parentNodeId &&
					edge.target === runningNode.id
				);
			});
			if (edge) {
				edge.animated = true;
			}
		}
		nodes = writable(bflowviz.nodes);
		edges = writable(bflowviz.edges);
		isInitialize = true;
	});

	onDestroy(() => {
		showRunNodeResultSubscriber.unsubscribe();
	});

	const showRunNodeResult = (nodeId: string) => {
		if (!bflowRunResult) {
			addToast(
				"BFlow has not been run yet. Please run it first.",
				ToastType.WARNING,
			);
			return;
		}

		if (!bflowRunResult[nodeId]) {
			addToast(
				"The result for the selected node was not found.",
				ToastType.WARNING,
			);
			return;
		}

		runNodeResult = bflowRunResult[nodeId];
		drawerElement?.show();
	};
</script>

{#if isInitialize}
	<main class="relative w-full h-full">
		<div class="w-full h-full">
			<SvelteFlow {nodeTypes} {nodes} {edges} fitView>
				<Controls />
				<Background patternColor="#aaa" gap={16} />
			</SvelteFlow>
		</div>
	</main>
	<Drawer bind:this={drawerElement} position="right">
		{#snippet modalContent()}
			<RunNodeResult
				code={runNodeResult?.code}
				result={runNodeResult?.result}
			></RunNodeResult>
		{/snippet}
	</Drawer>
{/if}
