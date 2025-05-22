<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();

	import postal from "postal";

	onMount(() => {
		if (typeof window !== "undefined" && !window.postal) {
			window.postal = postal;
		}
	});
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
