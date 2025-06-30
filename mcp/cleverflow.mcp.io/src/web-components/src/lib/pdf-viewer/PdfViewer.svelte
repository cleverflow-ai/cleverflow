<svelte:options customElement="pdf-viewer" />

<script lang="ts">
	import PdfViewer from "svelte-pdf";
	import css from "../../app.css?inline";
	import { TriangleAlert } from "lucide-svelte";

	let { pdfUrl, base64Content, pageNum = 1 } = $props();

	function toArrayBuffer(base64: string) {
		const binaryString = atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return bytes.buffer;
	}
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

<div class="relative flex justify-center">
	<div class="pdfViewer flex justify-center">
		{#if pdfUrl}
			<PdfViewer
				url={pdfUrl}
				showButtons={["navigation", "pageInfo"]}
				showBorder={true}
				pageNum={1}
				scale={1}
				showTopButton={false}
				rotation={0}
			/>
		{:else if base64Content}
			<PdfViewer
				url={null}
				data={toArrayBuffer(base64Content)}
				showButtons={["navigation", "pageInfo"]}
				showBorder={true}
				{pageNum}
				scale={1}
				showTopButton={false}
				rotation={0}
			/>
		{:else}
			<div
				class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
			>
				<TriangleAlert />
				<div>
					<p class="font-bold">pdf-viewer</p>
					<p class="text-xs opacity-60">
						Either <code>pdfUrl</code> or <code>base64Content</code>
						must be provided.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
