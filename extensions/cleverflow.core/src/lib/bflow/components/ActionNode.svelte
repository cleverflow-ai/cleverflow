<script>
	import { NodeToolbar, Handle, Position } from '@xyflow/svelte';
	import { onMount, onDestroy } from 'svelte';
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div class="w-[100px] h-[50px] border border-black flex items-center justify-center">
</div>

<style>
</style>
