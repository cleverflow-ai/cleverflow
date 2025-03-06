<script>
	import { Handle, Position } from "@xyflow/svelte";
	import { Bot } from "lucide-svelte";
	import { onMount } from "svelte";
	import { BFlowNodeState } from "../agent/models/BFlowNodeState.js";

	let { data } = $props();

	let borderColor = $state("border-black");
	onMount(() => {
		switch (data.state) {
			case BFlowNodeState.SUCCESS:
				borderColor = "border-green-500";
				break;
			case BFlowNodeState.RUNNING:
				borderColor = "border-orange-500";
				break;
			case BFlowNodeState.FAILURE:
				borderColor = "border-red-500";
				break;
			default:
				borderColor = "border-black";
				break;
		}
	});
</script>

<Handle type="target" position={Position.Top} />
<!-- <Handle type="source" position={Position.Bottom} /> -->

<div class="w-max-full w-full h-full flex flex-col items-start justify-between">
	<div
		class="w-full flex-1 border {borderColor} flex items-center justify-center p-4"
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
