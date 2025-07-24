<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import xyflowCss from "@xyflow/svelte/dist/style.css?inline";
	import { CircleX, RefreshCcw, Zap, Network, Flame } from "lucide-svelte";
	import type BFlowController from "./BFlowController.js";
	import BFlowView from "./visualization/BFlowView.svelte";
	import LoadingIndicator from "../common/components/LoadingIndicator.svelte";
	import { BFLowState } from "./BFlowState.js";
	import Toast from "../common/components/toast/Toast.svelte";
	import JsonForm from "../dynamicform/JsonForm.svelte";
	import md5 from "md5";

	let props = $props();
	let { text = "", id = null, theme = "crimson" } = props;
	let { controller }: { controller: BFlowController } = props;
	let refreshKey = $state("");

	onMount(async () => {
		if (controller) {
			controller.refresh = () => {
				refreshKey = md5(new Date().toISOString());
			};
		}

		if (text && controller.state === BFLowState.CONNECT_SUCCESS) {
			// Connected and text is provided, start the BFlow process
			await renderBFlow();
		}
	});

	const convertStateToMessage = (state: BFLowState) => {
		switch (state) {
			case BFLowState.NONE:
				return "Not rendered. Please render it.";
			case BFLowState.CONNECTING:
				return "Connecting...";
			case BFLowState.CONNECT_SUCCESS:
				return "Connected successfully";
			case BFLowState.CONNECT_FAILED:
				return "Failed to connect. Please try again.";
			case BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW:
				return "Converting Markdoc Custom Element to BFlow...";
			case BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS:
				return "Successfully converted Markdoc Custom Element to BFlow";
			case BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED:
				return "Failed to convert Markdoc Custom Element to BFlow";
			case BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ:
				return "Converting BFlow to BFlowViz...";
			case BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS:
				return "Successfully converted BFlow to BFlowViz";
			case BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED:
				return "Failed to convert BFlow to BFlowViz";
			case BFLowState.RUN_BFLOW:
				return "Running BFlow...";
			case BFLowState.RUN_BFLOW_IN_PROGRESS:
				return "BFlow is running";
			case BFLowState.RUN_BFLOW_SUCCESS:
				return "Successfully ran BFlow";
			case BFLowState.RUN_BFLOW_FAILED:
				return "Failed to run BFlow";
			default:
				return "";
		}
	};

	const renderBFlow = async () => {
		try {
			const isConnected = await controller.connect();
			if (isConnected) {
				await controller.ensureBFlow(text);
			}
		} catch (exception: any) {
			console.error(exception);
		}
	};

	const rerenderBFlow = async () => {
		await controller.ensureBFlow(text);
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>

{#snippet renderRunBFlowState()}
	{#if controller.state === BFLowState.RUN_BFLOW || controller.state === BFLowState.RUN_BFLOW_IN_PROGRESS}
		<button class="btn preset-filled-warning-500">
			<Flame class="animate-spin w-5 h-5" />
			Running
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_SUCCESS}
		<button class="btn preset-filled-success-500">
			<Flame class="text-white-700 w-5 h-5" />
			Successfully
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_FAILED}
		<button class="btn preset-filled-error-500">
			<Flame class="text-white-700 w-5 h-5" />
			Failed
		</button>
	{/if}
{/snippet}

{#key refreshKey}
	<main data-theme={theme} class="px-4">
		<div class="flex items-end justify-between gap-2 mb-2">
			<!-- {#if id}
				<span class="badge preset-filled-surface-500">{id}</span>
			{/if} -->
			<div></div>
			{#if controller.bflowviz}
				<div class="flex justify-end items-center gap-2">
					{@render renderRunBFlowState()}
				</div>
			{/if}
		</div>
		<div class="w-full h-[500px]">
			{#if !text}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<CircleX class="text-red-700 w-10 h-10" />
					<div>No URL or text provided</div>
				</div>
			{:else}
				<div class="relative w-full h-full">
					<BFlowView
						bflowRunResult={controller.bflowRunResult}
						bflowviz={controller.bflowviz}
					>
						<div slot="run-button">
							<div class="w-full flex justify-center mt-4 mb-6">
								{#if controller.isDocumentChanged(text)}
									<div
										class="w-full flex justify-center items-center gap-3"
									>
										<button
											class="btn preset-outlined-primary-500"
											onclick={async () =>
												await renderBFlow()}
										>
											Markdoc changed. Re-Render BFlow
										</button>
										{#if controller.state == BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS || controller.state == BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED || controller.state == BFLowState.RUN_BFLOW_SUCCESS || controller.state == BFLowState.RUN_BFLOW_FAILED}
											<button
												class="btn preset-filled-primary-500"
												onclick={async () =>
													await controller.executeBFlow()}
											>
												Run BFlow
											</button>
										{/if}
									</div>
								{:else if controller.state == BFLowState.NONE || controller.state == BFLowState.CONNECT_SUCCESS}
									<div
										class="h-full w-full flex flex-col items-center justify-center gap-2"
									>
										<div>
											{convertStateToMessage(
												controller.state,
											)}
										</div>
										<button
											class="btn preset-filled-primary-500"
											onclick={async () =>
												await renderBFlow()}
										>
											Render BFlow
										</button>
									</div>
								{:else if controller.state == BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS}
									<div
										class="h-full w-full flex flex-col items-center justify-center gap-2"
									>
										<div>
											{convertStateToMessage(
												controller.state,
											)}
										</div>
										<div
											class="w-full flex justify-center items-center gap-3"
										>
											<button
												class="btn preset-outlined-primary-500"
												onclick={async () =>
													await renderBFlow()}
											>
												Re-Render BFlow
											</button>
											<button
												class="btn preset-filled-primary-500"
												onclick={async () =>
													await controller.executeBFlow()}
											>
												Run BFlow
											</button>
										</div>
									</div>
								{:else if controller.state == BFLowState.RUN_BFLOW_SUCCESS || controller.state === BFLowState.RUN_BFLOW_FAILED}
									<div
										class="h-full w-full flex flex-col items-center justify-center gap-2"
									>
										<div>
											{convertStateToMessage(
												controller.state,
											)}
										</div>
										<div
											class="w-full flex justify-center items-center gap-3"
										>
											<button
												class="btn preset-outlined-primary-500"
												onclick={async () =>
													await renderBFlow()}
											>
												Re-Render BFlow
											</button>
											<button
												class="btn preset-filled-primary-500"
												onclick={async () =>
													await controller.executeBFlow()}
											>
												Re-Run BFlow
											</button>
										</div>
									</div>
								{:else if controller.isFailedState(controller.state)}
									<div
										class="h-full w-full flex flex-col items-center justify-center gap-2"
									>
										<CircleX
											class="text-red-700 w-10 h-10"
										/>
										<div>
											{convertStateToMessage(
												controller.state,
											)}
										</div>
										{#if controller.state === BFLowState.CONNECT_FAILED || controller.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED || controller.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED}
											<button
												class="btn preset-filled-primary-500"
												onclick={async () =>
													await rerenderBFlow()}
											>
												Re-Render BFlow
											</button>
										{:else}
											<div
												class="w-full flex justify-center items-center gap-3"
											>
												<button
													class="btn preset-outlined-primary-500"
													onclick={async () =>
														await renderBFlow()}
												>
													Re-Render BFlow
												</button>
												<button
													class="btn preset-filled-primary-500"
													onclick={async () =>
														await controller.executeBFlow()}
												>
													Re-Run BFlow
												</button>
											</div>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</BFlowView>

					{#if controller.isStateLoading(controller.state) && controller.state !== BFLowState.RUN_BFLOW_IN_PROGRESS}
						<div
							class="absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center gap-2"
						>
							<LoadingIndicator
								message={convertStateToMessage(
									controller.state,
								)}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<Toast />
		<JsonForm />
	</main>
{/key}
