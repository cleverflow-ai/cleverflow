<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte";
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

	let drawerState = $state(false);

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

	const drawerClose = () => {
		drawerState = false;
	};

	const showRunNodeResult = (nodeId: string) => {
		console.log(bflowRunResult);
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
		drawerState = true;
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
<Modal
	open={drawerState}
	onOpenChange={(e) => (drawerState = e.open)}
	triggerBase="btn preset-tonal"
	contentBase="fixed top-0 left-0 bg-surface-100-900 p-4 space-y-4 shadow-xl w-[480px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
>
	{#snippet content()}
		<RunNodeResult code={runNodeResult?.code} result={runNodeResult?.result}
		></RunNodeResult>
		<footer>
			<button
				type="button"
				class="btn preset-filled"
				onclick={drawerClose}>Close Drawer</button
			>
		</footer>
	{/snippet}
</Modal>
