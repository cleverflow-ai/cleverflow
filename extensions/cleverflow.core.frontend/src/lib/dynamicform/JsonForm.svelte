<svelte:options customElement="json-form" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import css from "../../app.css?inline";
	import { SimpleForm } from "@sjsf/form";
	import { resolver } from "@sjsf/form/resolvers/basic";
	import { translation } from "@sjsf/form/translations/en";
	import { theme as skeletonTheme } from "@sjsf/skeleton3-theme";
	import { TriangleAlert } from "lucide-svelte";

	let props = $props();
	let { theme = "crimson" } = props;

	let isVisible = $state(false);

	let channel: any;
	let subscription: any;

	let event: any;
	let jsonForm = $state({});
	let serverMessage = $state(null);

	onMount(async () => {
		const postal = window.postal;
		channel = postal?.channel("dynamic-form-channel");
		subscription = channel?.subscribe(
			"show-dynamic-form",
			async (payload: any) => {
				event = payload.event;
				jsonForm = payload.form;
				serverMessage = payload.serverMessage;
				isVisible = true;
			},
		);
	});

	onDestroy(() => {
		isVisible = false;
		subscription?.unsubscribe();
	});

	const onSubmit = (data: any) => {
		isVisible = false;
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
			<div
				class="json-form flex flex-col items-center justify-center h-full"
			>
				<div
					class="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white dark:bg-surface-950 mx-auto p-4 flex flex-col items-center justify-center card shadow-lg"
				>
					<SimpleForm
						theme={skeletonTheme}
						{translation}
						{resolver}
						schema={jsonForm}
						validator={{ isValid: () => true }}
						{onSubmit}
					/>
					{#if serverMessage}
						<div
							class="w-full rounded-none flex justify-start items-center card preset-outlined-error-500 items-center gap-4 p-2 mt-4"
						>
							<TriangleAlert class="w-5 h-5" />
							<div>
								<p class="text-xs opacity-60">
									{serverMessage}
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/snippet}
	</Modal>
</main>
