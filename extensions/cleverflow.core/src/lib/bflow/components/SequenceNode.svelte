<script>
	import { NodeToolbar, Handle, Position } from '@xyflow/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { ArrowRight } from 'lucide-svelte/icons';
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<div class="w-[50px] h-[50px] border border-black flex items-center justify-center">
	<ArrowRight />
</div>

<style>
</style>
