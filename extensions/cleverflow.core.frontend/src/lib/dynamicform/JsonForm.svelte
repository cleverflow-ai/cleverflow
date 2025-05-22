<svelte:options customElement="json-form" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import css from "../../app.css?inline";
	import "@jsfe/shoelace";
	import type { FromSchema, JSONSchema7, Jsf } from "@jsfe/shoelace";

	let props = $props();
	let { theme = "crimson" } = props;

	let isVisible = $state(false);

	let channel: any;
	let subscription: any;

	let event: any;

	let mySchema = {} as const satisfies JSONSchema7;
	type MyData = FromSchema<typeof mySchema>;
	let dataInSvelte: MyData = $state({});

	onMount(async () => {
		const postal = window.postal;
		channel = postal?.channel("dynamic-form-channel");
		subscription = channel?.subscribe(
			"show-dynamic-form",
			async (payload: any) => {
				event = payload.event;
				mySchema = payload.form;
				isVisible = true;
			},
		);
	});

	onDestroy(() => {
		subscription?.unsubscribe();
	});

	function assertValidData(data: unknown): data is MyData {
		// Use your AJV or other schema checker here, if you need thorough validation
		// ...
		return true;
	}

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
				channel?.publish("dynamic-form-submit", {
					event,
					formData: newData,
				});
				isVisible = false;
			}
		};
	}
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

<main data-theme={theme}>
	<Modal
		open={isVisible}
		onOpenChange={(e) => {
			isVisible = e.open;
		}}
		triggerBase="btn preset-tonal"
		contentBase="h-screen w-screen"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet content()}
			<div class="flex flex-col items-center justify-center h-full">
				<!-- <div class="flex items-center justify-end w-full p-4">
					<button
						type="button"
						class="btn preset-tonal-surface"
						onclick={() => (shopModalState = false)}
						><X class="w-8 h-8" /></button
					>
				</div> -->
				<div
					class="card bg-white dark:bg-gray-900 rounded-xl p-6 max-w-screen-sm w-full shadow-2xl space-y-4"
				>
					<article id="svelte">
						<jsf-shoelace use:formBinding></jsf-shoelace>
					</article>
				</div>
			</div>
		{/snippet}
	</Modal>
</main>
