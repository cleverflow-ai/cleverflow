<svelte:options customElement="b-flow" />

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import css from "../../app.css?inline";
	import xyflowCss from "@xyflow/svelte/dist/style.css?inline";
	import {
		CircleX,
		RefreshCcw,
		Zap,
		Network,
		Flame,
		FileUp,
	} from "lucide-svelte";
	import type BFlowController from "./BFlowController.js";
	import BFlowView from "./visualization/BFlowView.svelte";
	import LoadingIndicator from "../common/components/LoadingIndicator.svelte";
	import { BFLowState } from "./BFlowState.js";
	import Toast from "../common/components/toast/Toast.svelte";
	import Modal from "../common/components/Modal.svelte";
	import postal from "postal";
	import {
		addToast,
		ToastType,
	} from "../common/components/toast/ToastStore.js";

	const bflowPostalChannel = postal.channel("B-Flow");

	let props = $props();
	let { url = "", text = "", id = null, theme = "crimson" } = props;
	let { controller }: { controller: BFlowController } = props;

	let uploadFileElement: any = $state();
	let filePathToUpload = $state("");

	let nodeRequireClientAction: any = $state(null);

	const showRunNodeResultSubscriber = bflowPostalChannel.subscribe(
		"upload-file",
		(payload: any) => {
			console.log(">>>> payload");
			console.log(payload);
			nodeRequireClientAction = payload.node;
			uploadFileElement?.setData(payload.node);
			uploadFileElement?.show();
		},
	);

	onMount(async () => {
		if ((url || text) && controller.state === BFLowState.CONNECT_SUCCESS) {
			await controller.loadBFlowViz(url, text);
		}
	});

	onDestroy(() => {
		showRunNodeResultSubscriber.unsubscribe();
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
			await controller.connect();
			await controller.loadBFlowViz(url, text);
		} catch (exception: any) {
			console.error(exception);
		}
	};

	const reload = async () => {
		await controller.loadBFlowViz(url, text);
	};

	const uploadFile = async () => {
		if (!filePathToUpload) {
			addToast("Please select a file to upload", ToastType.ERROR);
			return;
		}

		uploadFileElement?.hide();
		nodeRequireClientAction = null;

		controller.addNodeResult(
			uploadFileElement?.getData(),
			filePathToUpload,
		);

		await controller.resumeBFlow();
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
	{#if controller.state === BFLowState.RUN_BFLOW || controller.state === BFLowState.RUN_BFLOW_IN_PROGRESS}
		<button class="btn preset-filled-warning-500">
			<Flame class="animate-spin w-5 h-5" />
			Running
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_SUCCESS}
		<button
			onclick={async () => await controller.runBFlow()}
			class="btn preset-filled-success-500"
		>
			<Flame class="text-white-700 w-5 h-5" />
			Run
		</button>
	{:else if controller.state === BFLowState.RUN_BFLOW_FAILED}
		<button
			onclick={async () => await controller.runBFlow()}
			class="btn preset-filled-error-500"
		>
			<Flame class="text-white-700 w-5 h-5" />
			Run
		</button>
	{:else}
		<button
			onclick={async () => await controller.runBFlow()}
			class="btn preset-filled-primary-500"
		>
			<Flame class="text-white-700 w-5 h-5" />
			Run
		</button>
	{/if}
{/snippet}

{#snippet requiredActionButton()}
	{#if nodeRequireClientAction.name === "upload-file"}
		<div class="flex flex-col items-end gap-1">
			<div class="text-error-500 bold animate-bounce">
				Action required
			</div>
			<button
				onclick={async () => await controller.runBFlow()}
				class="btn preset-filled-primary-500"
			>
				<FileUp class="text-white-700 w-5 h-5" />
				Upload File
			</button>
		</div>
	{/if}
{/snippet}

<main data-theme={theme}>
	<div class="flex items-end justify-between gap-2">
		{#if id}
			<span class="badge preset-filled-surface-500">{id}</span>
		{/if}
		{#if controller.bflowviz}
			<div class="flex justify-end items-center gap-2">
				{#if controller.isDocumentChanged(url, text)}
					{@render reloadBFlowButton()}
				{/if}
				{#if nodeRequireClientAction}
					{@render requiredActionButton()}
				{:else}
					{@render runBFlowButton()}
				{/if}
			</div>
		{/if}
	</div>
	<div class="w-full border border-gray-300 p-4 h-[500px]">
		{#key controller.stateKey}
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
						<BFlowView
							bflowRunResult={controller.bflowRunResult}
							bflowviz={controller.bflowviz}
						/>
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
		{/key}
	</div>

	<Toast />
	<Modal bind:this={uploadFileElement}>
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
	</Modal>
</main>
