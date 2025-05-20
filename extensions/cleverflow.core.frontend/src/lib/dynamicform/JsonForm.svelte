<svelte:options customElement="json-form" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import postal from "postal";
	import "@jsfe/shoelace";
	import type { FromSchema, JSONSchema7, Jsf } from "@jsfe/shoelace";

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

	const mySchema = {
		title: "Sign-up form",
		description: "A simple form example.",
		type: "object",
		required: ["FirstName", "LastName"],
		properties: {
			FirstName: {
				type: "string",
				title: "First name",
				default: "Chuck",
			},
			LastName: {
				type: "string",
				title: "Last name",
			},
			Age: {
				type: "integer",
				title: "Age",
				minimum: 13,
				maximum: 150,
			},
			Bio: {
				type: "string",
				title: "Bio",
			},
			Email: {
				title: "Email",
				format: "email",
				type: "string",
			},
			Password: {
				type: "string",
				title: "Password",
				format: "password",
				minLength: 3,
			},
			Telephone: {
				type: "string",
				title: "Telephone",
				minLength: 10,
			},
		},
	} as const satisfies JSONSchema7;
	type MyData = FromSchema<typeof mySchema>;

	function assertValidData(data: unknown): data is MyData {
		// Use your AJV or other schema checker here, if you need thorough validation
		// ...
		return true;
	}

	let dataInSvelte: MyData = $state({
		foo: "hello",
	});

	function formBinding(form: Jsf) {
		form.data = dataInSvelte;
		form.schema = /* Type-casted as JSONSchema7 */ mySchema;
		form.uiSchema = {
			/* Type-casted as UiSchema */
			bar: {
				"ui:widget": "switch",
			},
		};
		form.dataChangeCallback = (newData: any) => {
			console.log({ "Data from Svelte": newData });

			if (assertValidData(newData)) dataInSvelte = newData;
			else console.error("Invalid data!");
		};
		form.submitCallback = (newData: any, valid: any) => {
			console.log({ "Submitted from Svelte!": newData, valid });

			if (assertValidData(newData)) {
				// Do stuff...
			}
		};
	}
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
	<article id="svelte">
		<jsf-shoelace use:formBinding></jsf-shoelace>
	</article>
	<div bind:this={serverWebComponentContainer}></div>
</main>
