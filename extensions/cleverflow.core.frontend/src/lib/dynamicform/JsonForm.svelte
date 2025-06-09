<svelte:options customElement="json-form" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import css from "../../app.css?inline";
	import { SimpleForm } from "@sjsf/form";
	import { resolver } from "@sjsf/form/resolvers/basic";
	import { translation } from "@sjsf/form/translations/en";
	import { theme as skeletonTheme } from "@sjsf/skeleton3-theme";

	let props = $props();
	let { theme = "crimson" } = props;

	let isVisible = $state(false);

	let channel: any;
	let subscription: any;

	let event: any;

	let jsonForm = $state({});

	onMount(async () => {
		const postal = window.postal;
		channel = postal?.channel("dynamic-form-channel");
		subscription = channel?.subscribe(
			"show-dynamic-form",
			async (payload: any) => {
				event = payload.event;
				jsonForm = payload.form;
				isVisible = true;
			},
		);
	});

	onDestroy(() => {
		subscription?.unsubscribe();
	});

	const onSubmit = (data: any) => {
		channel?.publish("dynamic-form-submit", {
			event,
			formData: data,
		});
	};
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
		backdropClasses="backdrop-blur-sm bg-surface-500/50"
	>
		{#snippet content()}
			<div class="flex flex-col items-center justify-center h-full">
				<div
					class="json-form-container bg-white dark:bg-surface-950 mx-auto p-4 flex flex-col items-center justify-center card shadow-lg"
				>
					<SimpleForm
						theme={skeletonTheme}
						{translation}
						{resolver}
						schema={jsonForm}
						validator={{ isValid: () => true }}
						{onSubmit}
					/>
				</div>
			</div>
		{/snippet}
	</Modal>
</main>
