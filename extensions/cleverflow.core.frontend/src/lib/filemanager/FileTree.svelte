<svelte:options customElement="file-tree" />

<script lang="ts">
	import { onMount } from "svelte";
	import css from "../../app.css?inline";
	import xyflowCss from "@xyflow/svelte/dist/style.css?inline";
	import TreeNode from "./TreeNode.svelte";

	let { controller } = $props();

	onMount(() => {
		console.log(controller.tree);
	});
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>

<ul class="text-sm font-medium">
	{#if controller.tree}
		<TreeNode node={controller.tree} {controller} />
	{/if}
</ul>
