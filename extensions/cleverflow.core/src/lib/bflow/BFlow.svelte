<svelte:options
	customElement={{
		tag: "b-flow",
		shadow: "none",
	}}
/>

<script lang="ts">
	import { onMount } from "svelte";
	import css from "../../app.css?inline";
	import xyflowCss from "@xyflow/svelte/dist/style.css?inline";
	import { CircleX, RefreshCcw, Zap, Play, Flame } from "lucide-svelte";
	import type BFlowController from "./BFlowController.js";
	import BFlowView from "./visualization/BFlowView.svelte";
	import LoadingIndicator from "../common/components/LoadingIndicator.svelte";
	import { BFLowState } from "./BFlowState.js";
	import Toast from "../common/components/toast/Toast.svelte";

	let props = $props();
	let { url = "", text = "", id = null, theme = "crimson" } = props;
	let { controller }: { controller: BFlowController } = props;

	onMount(async () => {
		if ((url || text) && controller.state === BFLowState.CONNECT_SUCCESS) {
			await controller.loadBFlowViz(url, text);
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
			case BFLowState.LIST_AGENTS:
				return "Loading agents...";
			case BFLowState.LIST_AGENTS_SUCCESS:
				return "Agents loaded successfully";
			case BFLowState.LIST_AGENTS_FAILED:
				return "Failed to load agents";
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
			await controller.connect();
			await controller.loadBFlowViz(url, text);
		} catch (exception: any) {
			console.error(exception);
		}
	};

	const reload = async () => {
		await controller.loadBFlowViz(url, text);
	};
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html xyflowCss}</svelte:element>
<main data-theme={theme}>
	<div class="flex items-center justify-between gap-2">
		{#if id}
			<span class="badge preset-filled-tertiary-500">BFlow: {id}</span>
		{/if}
		{#if controller.bflowviz}
			{@const isBFlowRunning = controller.state === BFLowState.RUN_BFLOW}
			{@const successfullyRanBFlow =
				controller.state === BFLowState.RUN_BFLOW_SUCCESS}
			{@const failedToRunBFlow =
				controller.state === BFLowState.RUN_BFLOW_FAILED}

			<div class="flex justify-end items-center gap-2">
				{#if controller.isDocumentChanged(url, text)}
					<button
						type="button"
						class="btn preset-tonal-primary"
						onclick={async () => await reload()}
					>
						<Zap class="w-5 h-5" />
						BFlow changed. Reload
					</button>
				{/if}
				<button
					onclick={async () => await controller.runBFlow()}
					class="
							btn
							{isBFlowRunning
						? 'preset-filled-warning-500'
						: successfullyRanBFlow
							? 'preset-filled-success-500'
							: failedToRunBFlow
								? 'preset-filled-error-500'
								: 'preset-filled-primary-500'}
						"
				>
					{#if isBFlowRunning}
						<Flame class="animate-spin w-5 h-5" />
						Running
					{:else}
						<Flame class="text-white-700 w-5 h-5" />
						Run
					{/if}
				</button>
			</div>
		{/if}
	</div>
	<div class="w-full border border-gray-300 p-4 h-[500px]">
		{#key controller.state}
			{#if !url && !text}
				<div
					class="h-full w-full flex flex-col items-center justify-center gap-2"
				>
					<CircleX class="text-red-700 w-10 h-10" />
					<div>No URL or text provided</div>
				</div>
			{:else if controller.bflowviz}
				<div class="relative w-full h-full">
					<div class="w-full h-full">
						<BFlowView data={controller.bflowviz} />
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
						<Play class="text-primary-500 w-10 h-10" />
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
		{/key}
	</div>

	<Toast />
</main>
