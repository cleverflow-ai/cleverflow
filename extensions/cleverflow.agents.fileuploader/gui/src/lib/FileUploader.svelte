<svelte:options customElement="file-uploader" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import pako from "pako";
	import css from "../app.css?inline";
	import {
		addToast,
		ToastType,
	} from "../../../../cleverflow.core.frontend/src/lib/common/components/toast/ToastStore.js";
	import FileUploadController from "./FileUploadController.svelte.js";

	let { servers, token, theme = "crimson" } = $props();

	let controller: FileUploadController = new FileUploadController(
		servers,
		token,
	);

	let fileName = "";
	let uint8Array: Uint8Array | null = $state(null);

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

	// Handle file selection
	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		fileName = file.name;

		// Read the file content as an ArrayBuffer
		const reader = new FileReader();
		reader.onload = async (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer; // Explicitly type as ArrayBuffer
			uint8Array = new Uint8Array(arrayBuffer); // Convert to Uint8Array for NATS
		};
		reader.readAsArrayBuffer(file); // Ensure we're reading as ArrayBuffer
	}

	const uploadFile = async () => {
		if (!uint8Array) {
			addToast("Please select a file to upload", ToastType.ERROR);
			return;
		}

		// Send file data to NATS server
		try {
			const compressedData = pako.deflate(uint8Array);
			await controller.upload({
				name: fileName,
				data: Array.from(compressedData),
			});
			uint8Array = null;
			console.log(`Sent ${fileName} to NATS server`);
		} catch (err) {
			console.error("Error publishing to NATS:", err);
		}
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<main data-theme={theme}>
	<div class="max-w-md mx-auto p-6 bg-white">
		<h2 class="text-xl font-semibold text-gray-700 mb-4">
			Upload Your File for Processing
		</h2>
		<p class="text-gray-600 mb-4">
			Please upload the required file to continue processing your request.
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
					type="file"
					onchange={handleFileChange}
				/>
			</div>

			<button
				disabled={!uint8Array}
				type="button"
				onclick={() => uploadFile()}
				class="btn preset-filled-primary-500 w-full py-2 hover:preset-filled-primary-300 transition"
			>
				Upload File
			</button>
		</form>
	</div>
</main>
