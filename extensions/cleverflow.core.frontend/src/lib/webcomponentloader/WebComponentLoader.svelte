<svelte:options customElement="web-component-loader" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import { TriangleAlert } from "lucide-svelte";

	let { name, url, base64Module, theme = "crimson", ...others } = $props();

	let isInitialized = $state(false);

	let attributes = $state("");
	let errorMessage: string | null = $state(null);

	onMount(async () => {
		attributes = Object.entries(others ?? {})
			.map(([key, val]) => `${key}="${val}"`)
			.join(" ");
		await loadWebComponentScript();
		isInitialized = true;
	});

	onDestroy(() => {});

	const loadWebComponentScript = async () => {
		try {
			if (!name) {
				errorMessage = "Web component tag name was not provided";
				return;
			}
			if (!url && !base64Module) {
				errorMessage = `Neither 'url' nor 'base64Module' was provided for the web component: ${name}`;
				return;
			}

			if (customElements.get(name)) return;

			if (url && !document.querySelector(`script[src="${url}"]`)) {
				const script = document.createElement("script");
				script.src = url;
				script.type = "module";
				script.async = true;
				document.head.appendChild(script);
			}

			if (base64Module) {
				const jsCode = atob(base64Module);
				const blob = new Blob([jsCode], {
					type: "application/javascript",
				});
				const blobUrl = URL.createObjectURL(blob);

				const script = document.createElement("script");
				script.src = blobUrl;
				script.type = "module";
				script.async = true;
				document.head.appendChild(script);
			}

			await customElements.whenDefined(name);
		} catch (exception: any) {
			errorMessage =
				exception?.message || String(exception) || "Unknown exception";
		}
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

<main data-theme={theme}>
	{#if isInitialized}
		{#if errorMessage}
			<div
				class="card preset-outlined-error-500 rounded-none flex items-center gap-4 p-4"
			>
				<TriangleAlert class="w-5 h-5" />
				<p class="text-xs opacity-60">{errorMessage}</p>
			</div>
		{:else}
			{@html `<${name} ${attributes}></${name}>`}
		{/if}
	{/if}
</main>
