<script lang="ts">
	import { Handle, Position } from "@xyflow/svelte";
	import { Bot } from "lucide-svelte";
	import { onMount } from "svelte";
	import { BFlowNodeState } from "../BFlowNodeState.js";
	import postal from "postal";

	const channel = postal.channel("b-flow-view");

	let { data } = $props();

	let borderColor = $state("border-surface-500");

	onMount(() => {
		switch (data.state) {
			case BFlowNodeState.SUCCESS:
				borderColor = "border-success-500";
				break;
			case BFlowNodeState.RUNNING:
				borderColor = "border-warning-500";
				break;
			case BFlowNodeState.FAILURE:
				borderColor = "border-error-500";
				break;
			default:
				borderColor = "border-surface-500";
				break;
		}
	});

	const showRunResult = () => {
		channel.publish("show-run-node-result", { id: data.id });
	};
</script>

<Handle type="target" position={Position.Top} />
<!-- <Handle type="source" position={Position.Bottom} /> -->

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="w-max-full w-full h-full flex flex-col items-start justify-between cursor"
	onclick={showRunResult}
>
	<div
		class="w-full flex-1 border-2 {borderColor} flex items-center justify-center p-4
		{data.state === BFlowNodeState.RUNNING ? 'border-dotted' : ''}"
	>
		{#if data.name}
			<div
				class={data.state === BFlowNodeState.RUNNING
					? "animate-bounce"
					: ""}
			>
				{data.name}
			</div>
		{/if}
	</div>
	{#if data.tool}
		<div class="w-full flex items-center justify-start gap-2">
			<Bot class="w-3 h-3" />
			<span class="flex-1 text-[10px] text-wrap">
				{data.tool.name}
			</span>
		</div>
	{/if}
</div>
