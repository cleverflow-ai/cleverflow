<script>
	import { Handle, Position } from "@xyflow/svelte";
	import { ArrowRight } from "lucide-svelte/icons";
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
<Handle type="source" position={Position.Bottom} />

<div
	class="w-full h-full border {borderColor} flex items-center justify-center p-4"
>
	<ArrowRight />
</div>

<style>
</style>
