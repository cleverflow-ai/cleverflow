<script>
	import { Loader } from "lucide-svelte";

	let { size = 40, message = "" } = $props();
</script>

<div class="h-full w-full flex flex-col items-center justify-center gap-2">
	<!-- Loading Icon -->
	<Loader class="animate-spin" style="width:{size}px; height: {size}px;" />

	<!-- Message -->
	{#if message && message.length > 0}
		<p class="text-sm text-gray-600">{message}</p>
	{/if}
</div>
