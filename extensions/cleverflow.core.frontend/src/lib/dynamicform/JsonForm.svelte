<svelte:options customElement="json-form" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import postal from "postal";

	let props = $props();
	let { url = "", text = "", id = null, theme = "crimson" } = props;

	let serverWebComponentContainer: any = $state();
	let serverWebComponentData: any = $state(null);

	const channel = postal.channel("json-schema-form");
	const subscription = channel.subscribe(
		"show-form",
		async (payload: any) => {
			serverWebComponentData = payload.guiData;
			showWebServerComponent();
		},
	);

	onMount(async () => {});

	onDestroy(() => {
		subscription.unsubscribe();
	});

	const onServerWebComponentFinished = () => {
		serverWebComponentData = null;
	};

	const showWebServerComponent = async () => {
		const binaryData = new Uint8Array(serverWebComponentData.buffer.data);
		const blob = new Blob([binaryData], {
			type: "application/javascript",
		});
		const moduleUrl = URL.createObjectURL(blob);

		try {
			if (!customElements.get(serverWebComponentData.webcomponent)) {
				await import(moduleUrl);
			}
		} catch (exception) {}

		if (serverWebComponentContainer) {
			let attributes = "";
			if (serverWebComponentData.attributes) {
				attributes = Object.entries(serverWebComponentData.attributes)
					.map(([key, value]) => `${key}="${value}"`)
					.join(" ");
			}
			serverWebComponentContainer.innerHTML = `<${serverWebComponentData.webcomponent} ${attributes} onFinished={onServerWebComponentFinished}></${serverWebComponentData.webcomponent}>`;
			requestAnimationFrame(() => {
				const webComponent = serverWebComponentContainer.querySelector(
					serverWebComponentData.webcomponent,
				);

				if (webComponent) {
					webComponent.addOnFinishedListener(
						onServerWebComponentFinished,
					);
				}
			});
		}
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

<!-- {#snippet serverWebComponentTriggerButton()}
	<div class="flex flex-col items-end gap-1">
		<div class="text-error-500 text-sm bold animate-bounce">
			Server is waiting for you
		</div>
		<button
			onclick={async () => await showWebServerComponent()}
			class="btn preset-filled-primary-500"
		>
			<TriangleAlert class="text-white-700 w-5 h-5" />
			Action Required
		</button>
	</div>
{/snippet} -->

<main data-theme={theme}>
	<div>this is JSON SCHEMA FORM</div>
	<div bind:this={serverWebComponentContainer}></div>
</main>
