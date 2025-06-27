<svelte:options customElement="pdf-viewer" />

<script>
	import PdfViewer from "svelte-pdf";

	let { pdfUrl, base64Content, pageNum = 1 } = $props();
</script>

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
			/>
		{:else if base64Content}
			<PdfViewer
				url={pdfUrl}
				data={base64Content}
				showButtons={["navigation", "pageInfo"]}
				showBorder={true}
				{pageNum}
				scale={1}
				showTopButton={false}
			/>
		{/if}
	</div>
</div>
