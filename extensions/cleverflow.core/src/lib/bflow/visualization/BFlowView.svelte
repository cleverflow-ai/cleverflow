<script>
	import { SvelteFlow, Controls, MiniMap, Background } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";
	import { onMount, onDestroy } from "svelte";
	import { writable, get } from "svelte/store";
	import EntryNode from "./EntryNode.svelte";
	import SequenceNode from "./SequenceNode.svelte";
	import ActionNode from "./ActionNode.svelte";

	const { data } = $props();

	const nodeTypes = {
		ENTRY: EntryNode,
		SEQUENCE: SequenceNode,
		ACTION: ActionNode,
	};

	const nodes = writable(data.nodes);
	const edges = writable(data.edges);

	onMount(async () => {});

	onDestroy(() => {});
</script>

<main class="relative w-full h-full">
	<!-- <div style="height: calc(100vh - 6rem);"> -->
	<div class="w-full h-full">
		<SvelteFlow {nodeTypes} {nodes} {edges} fitView>
			<Controls />
			<MiniMap zoomable pannable height={120} />
			<Background patternColor="#aaa" gap={16} />
		</SvelteFlow>
	</div>
</main>
