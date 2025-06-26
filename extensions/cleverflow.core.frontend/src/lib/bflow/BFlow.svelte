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
			await start();
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

	const start = async () => {
		try {
			const isConnected = await controller.connect();
			if (isConnected) {
				await controller.ensureBFlow(text);
			}
		} catch (exception: any) {
			console.error(exception);
		}
	};

	const reload = async () => {
		await controller.ensureBFlow(text);
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>

{#snippet reloadBFlowButton()}
	<button
		type="button"
		class="btn preset-tonal-primary"
		onclick={async () => await reload()}
	>
		<Zap class="w-5 h-5" />
		BFlow changed. Reload
	</button>
{/snippet}

{#snippet runBFlowButton()}
	{#if controller.state !== BFLowState.RUN_BFLOW && controller.state !== BFLowState.RUN_BFLOW_IN_PROGRESS}
		<button
			onclick={async () => await controller.executeBFlow()}
			class="btn preset-filled-primary-500"
		>
			Run BFlow
		</button>
	{/if}
{/snippet}

{#snippet runBFlowState()}
	{#if controller.state === BFLowState.RUN_BFLOW || controller.state === BFLowState.RUN_BFLOW_IN_PROGRESS}
		<button class="btn preset-filled-warning-500">
			<Flame class="animate-spin w-5 h-5" />
			Running
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_SUCCESS}
		<button class="btn preset-filled-success-500">
			<Flame class="text-white-700 w-5 h-5" />
			Succeeded
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_FAILED}
		<button class="btn preset-filled-error-500">
			<Flame class="text-white-700 w-5 h-5" />
			Failed
		</button>
	{/if}
{/snippet}

{#key refreshKey}
	<main data-theme={theme}>
		<div class="flex items-end justify-between gap-2">
			{#if id}
				<span class="badge preset-filled-surface-500">{id}</span>
			{/if}
			{#if controller.bflowviz}
				<div class="flex justify-end items-center gap-2">
					{#if controller.isDocumentChanged(text)}
						{@render reloadBFlowButton()}
					{/if}
					{@render runBFlowState()}
				</div>
			{/if}
		</div>
		<div class="w-full border border-gray-300 p-4 h-[500px]">
			{#if !text}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<CircleX class="text-red-700 w-10 h-10" />
					<div>No URL or text provided</div>
				</div>
			{:else if controller.bflowviz}
				<div class="relative w-full h-full">
					<div class="w-full h-full">
						<BFlowView
							bflowRunResult={controller.bflowRunResult}
							bflowviz={controller.bflowviz}
						/>
					</div>
					<div
						class="absolute bottom-5 left-0 right-0 flex justify-center"
					>
						{@render runBFlowButton()}
					</div>
				</div>
			{:else if controller.state == BFLowState.NONE || controller.state == BFLowState.CONNECT_FAILED}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<div>{convertStateToMessage(controller.state)}</div>
					<button
						class="cursor-pointer"
						onclick={async () => await start()}
					>
						<Network class="text-primary-500 w-10 h-10" />
					</button>
				</div>
			{:else if controller.state == BFLowState.NONE || controller.isStateLoading(controller.state) || controller.isFinishedState(controller.state)}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<LoadingIndicator
						message={convertStateToMessage(controller.state)}
					/>
				</div>
			{:else if controller.isFailedState(controller.state)}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<CircleX class="text-red-700 w-10 h-10" />
					<div>{convertStateToMessage(controller.state)}</div>
					<button
						class="cursor-pointer"
						onclick={async () => await reload()}
					>
						<RefreshCcw class="text-red-700 w-10 h-10" />
					</button>
				</div>
			{:else}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<div>
						An error occurred. Please click the refresh button below
						to try again. Thank you for your patience.
					</div>
					<button
						class="cursor-pointer"
						onclick={async () => await reload()}
					>
						<RefreshCcw class="text-red-700 w-10 h-10" />
					</button>
				</div>
			{/if}
		</div>
		<Toast />
		<JsonForm />
	</main>
{/key}
