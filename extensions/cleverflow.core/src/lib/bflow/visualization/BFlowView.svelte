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

	const channel = postal.channel("B-Flow");

	const { bflowRunResult, bflowviz } = $props();

	const nodeTypes = {
		ENTRY: EntryNode,
		SEQUENCE: SequenceNode,
		ACTION: ActionNode,
	};

	const nodes = writable(bflowviz.nodes);
	const edges = writable(bflowviz.edges);

	let drawerElement: any;

	let runNodeResult: any = $state(null);

	const showRunNodeResultSubscriber = channel.subscribe(
		"show-run-node-result",
		(payload: any) => {
			showRunNodeResult(payload.id);
		},
	);

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
		<RunNodeResult code={runNodeResult?.code} result={runNodeResult?.result}
		></RunNodeResult>
	{/snippet}
</Drawer>
