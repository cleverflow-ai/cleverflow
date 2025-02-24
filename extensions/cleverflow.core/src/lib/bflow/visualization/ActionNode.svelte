<script>
	import { NodeToolbar, Handle, Position } from "@xyflow/svelte";
	import { onMount, onDestroy } from "svelte";

	let { data } = $props();
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div
	class="w-full h-full border border-black flex items-center justify-center p-4"
>
	{#if data.name}
		{data.name}
	{/if}
</div>

<style>
</style>
