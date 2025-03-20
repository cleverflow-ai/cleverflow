<svelte:options customElement="file-uploader" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../../app.css?inline";
	import LoadingIndicator from "../components/LoadingIndicator.svelte";
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import { X } from "lucide-svelte";
	import { addToast, ToastType } from "../components/toast/ToastStore.js";
	import FileUploadController from "./FileUploadController.svelte.js";

	let { servers, token, subject, theme = "crimson" } = $props();

	let controller: FileUploadController = new FileUploadController(
		servers,
		token,
		subject,
	);

	let filePathToUpload = $state("");
	let isOpen = $derived(controller.modalShow);

	onMount(async () => {
		try {
			await controller.connect();
		} catch (exception: any) {
			console.error(exception);
		}
	});

	onDestroy(async () => {
		try {
			await controller.disconnect();
		} catch (exception: any) {
			console.error(exception);
		}
	});

	const uploadFile = async () => {
		if (!filePathToUpload) {
			addToast("Please select a file to upload", ToastType.ERROR);
			return;
		}

		controller.upload("File content is coming soon!");
		// uploadFileElement?.hide();
		// nodeRequireClientAction = null;

		// controller.addNodeResult(
		// 	uploadFileElement?.getData(),
		// 	filePathToUpload,
		// );

		// await controller.resumeBFlow();
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<main data-theme={theme}>
	<div>hey man! This is a component call File-Uploader</div>
	{#snippet close()}
		<div class="absolute top-0 right-0">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div onclick={() => (controller.modalShow = false)}>
				<X class="text-surface-400 w-7 h-7" />
			</div>
		</div>
	{/snippet}
	{#snippet modalContent()}
		<div class="max-w-md mx-auto p-6 bg-white">
			<h2 class="text-xl font-semibold text-gray-700 mb-4">
				Upload Your File for Processing
			</h2>
			<p class="text-gray-600 mb-4">
				Please upload the required file to continue processing your
				request.
			</p>

			<form>
				<div class="mb-4">
					<label
						for="file-input"
						class="block text-sm font-medium text-gray-700"
						>Choose a file</label
					>
					<input
						class="input mt-1 w-full"
						type="text "
						bind:value={filePathToUpload}
					/>
				</div>

				<button
					type="button"
					onclick={() => uploadFile()}
					class="btn preset-filled-primary-500 w-full py-2 hover:preset-filled-primary-300 transition"
				>
					Upload File
				</button>
			</form>
		</div>
	{/snippet}
	<Modal
		open={isOpen}
		onOpenChange={(e) => (controller.modalShow = e.open)}
		triggerBase="btn preset-tonal"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet content()}
			<div class="relative">
				{@render close()}
				{@render modalContent()}
			</div>
		{/snippet}
	</Modal>
</main>
