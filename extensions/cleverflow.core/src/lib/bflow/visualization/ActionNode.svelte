<script>
	import { NodeToolbar, Handle, Position } from "@xyflow/svelte";
	import { onMount, onDestroy } from "svelte";
	import { Bot } from "lucide-svelte";

	let { data } = $props();

	console.log(data);
</script>

<Handle type="target" position={Position.Top} />
<!-- <Handle type="source" position={Position.Bottom} /> -->

<div class="w-max-full w-full h-full flex flex-col items-start justify-between">
	<div
		class="w-full flex-1 border border-black flex items-center justify-center p-4"
	>
		{#if data.name}
			{data.name}
		{/if}
	</div>
	{#if data.agent}
		<div class="w-full flex items-center justify-start gap-2">
			<Bot class="w-3 h-3" />
			<span class="flex-1 text-[10px] text-wrap">
				{data.agent.name}
			</span>
		</div>
	{/if}
</div>

<style>
</style>
