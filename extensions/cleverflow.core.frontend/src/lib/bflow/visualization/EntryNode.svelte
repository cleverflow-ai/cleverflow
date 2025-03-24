<script>
	import { Handle, Position } from "@xyflow/svelte";
	import { onMount } from "svelte";
	import { BFlowNodeState } from "../agent/models/BFlowNodeState.js";

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
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div class="w-full h-full rounded-full border-2 {borderColor} p-4"></div>

<style>
</style>
