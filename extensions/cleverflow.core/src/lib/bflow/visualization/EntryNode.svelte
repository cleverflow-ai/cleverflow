<script>
	import { NodeToolbar, Handle, Position } from "@xyflow/svelte";
	import { onMount, onDestroy } from "svelte";
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div class="w-full h-full rounded-full border border-black p-4"></div>

<style>
</style>
