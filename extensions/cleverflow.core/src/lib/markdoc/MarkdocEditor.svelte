<svelte:options customElement="markdoc-editor" />

<script>
	let { name = 'dummy.mdoc' } = $props();
</script>

<h1>Editting {name}!</h1>
<slot />