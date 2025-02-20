<script>
	import { NodeToolbar, Handle, Position } from '@xyflow/svelte';
	import { onMount, onDestroy } from 'svelte';
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div class="w-[50px] h-[50px] rounded-full border border-black"></div>

<style>
</style>
