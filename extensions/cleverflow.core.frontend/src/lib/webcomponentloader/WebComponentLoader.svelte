<svelte:options customElement="web-component-loader" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import { TriangleAlert } from "lucide-svelte";

	let {
		theme = "crimson",
		tag,
		scriptUrl,
		scriptBase64,
		propBindings,
		bindingData,
	} = $props();

	let isInitialized = $state(false);

	let errorMessage: string | null = $state(null);
	let attributes = $state("");

	onMount(async () => {
		await loadWebComponentScript();
		buildHtmlAttributes();
		isInitialized = true;
	});

	onDestroy(() => {});

	const loadWebComponentScript = async () => {
		try {
			if (!tag) {
				errorMessage = "Web component tag name was not provided";
				return;
			}
			if (!scriptUrl && !scriptBase64) {
				errorMessage = `Neither 'scriptUrl' nor 'scriptBase64' was provided for the web component: ${tag}`;
				return;
			}

			if (customElements.get(tag)) return;

			if (
				scriptUrl &&
				!document.querySelector(`script[src="${scriptUrl}"]`)
			) {
				const script = document.createElement("script");
				script.src = scriptUrl;
				script.type = "module";
				script.async = true;
				document.head.appendChild(script);
			}

			if (scriptBase64) {
				const jsCode = atob(scriptBase64);
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

			await customElements.whenDefined(tag);
		} catch (exception: any) {
			errorMessage =
				exception?.message || String(exception) || "Unknown exception";
		}
	};

	const buildHtmlAttributes = () => {
		for (let i = 0; i < propBindings.length; i++) {
			const { componentProp, dataPath } = propBindings[i];
			if (bindingData && bindingData[dataPath]) {
				attributes += ` ${componentProp}='${bindingData[dataPath]}'' `;
			}
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
			{@html `<${tag}  ${attributes} </${tag}>`}
		{/if}
	{/if}
</main>
