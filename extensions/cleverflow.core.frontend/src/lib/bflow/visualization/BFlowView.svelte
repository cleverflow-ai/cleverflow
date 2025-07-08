<script lang="ts">
	import { SvelteFlow, Controls, Background } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";
	import { writable } from "svelte/store";
	import EntryNode from "./EntryNode.svelte";
	import SequenceNode from "./SequenceNode.svelte";
	import ActionNode from "./ActionNode.svelte";
	import { onDestroy, onMount } from "svelte";
	import postal from "postal";
	import {
		addToast,
		ToastType,
	} from "../../common/components/toast/ToastStore.js";
	import Drawer from "../../common/components/Drawer.svelte";
	import RunNodeResult from "./RunNodeResult.svelte";
	import _ from "lodash";
	import { BFlowNodeState } from "../BFlowNodeState.js";
	import LoadingIndicator from "../../common/components/LoadingIndicator.svelte";
	import { TriangleAlert } from "lucide-svelte";
	import { WebComponentLoader } from "../../webcomponentloader/WebComponentLoader.js";

	const channel = postal.channel("b-flow-view");

	const { bflowRunResult, bflowviz } = $props();
	let actionNodeResults: any[] = $state([]);

	const nodeTypes = {
		ENTRY: EntryNode,
		SEQUENCE: SequenceNode,
		ACTION: ActionNode,
	};

	let isInitialize = $state(false);
	let nodes = $state(writable([]));
	let edges = $state(writable([]));

	let drawerElement: any = $state();

	let actionNodeResultToDisplay: any = $state(null);

	const showRunNodeResultSubscriber = channel.subscribe(
		"show-run-node-result",
		(payload: any) => {
			showRunNodeResult(payload.id);
		},
	);

	onMount(() => {
		_.forEach(bflowviz.edges, (edge: any) => {
			edge.animated = false;
		});
		_.forEach(bflowviz.nodes, (runningNode) => {
			if (
				runningNode?.data?.state === BFlowNodeState.RUNNING ||
				runningNode?.data?.state === BFlowNodeState.WAITING_FOR_DATA
			) {
				const edge = _.find(bflowviz.edges, (edge: any) => {
					return (
						edge.source === runningNode.parentNodeId &&
						edge.target === runningNode.id
					);
				});

				if (edge) {
					edge.animated = true;
				}
			}
		});

		nodes = writable(bflowviz.nodes);
		edges = writable(bflowviz.edges);
		isInitialize = true;

		actionNodeResults = [];
		for (const key in bflowRunResult) {
			if (bflowRunResult.hasOwnProperty(key)) {
				const data = bflowRunResult[key];
				if (
					data.content &&
					Array.isArray(data.content) &&
					data.content.length > 0
				) {
					const content = data.content[0];
					actionNodeResults.push({
						id: key,
						bindingData: content.resource,
						dynamicComponent: content.resource?.dynamicComponent,
					});
				}
			}
		}
	});

	onDestroy(() => {
		showRunNodeResultSubscriber.unsubscribe();
	});

	const showRunNodeResult = (nodeId: string) => {
		if (!actionNodeResults || actionNodeResults.length === 0) {
			addToast(
				"BFlow has not been run yet. Please run it first.",
				ToastType.WARNING,
			);
			return;
		}

		actionNodeResultToDisplay = _.find(
			actionNodeResults,
			(result) => result.id === nodeId,
		);

		if (!actionNodeResultToDisplay) {
			addToast(
				"The result for the selected node was not found.",
				ToastType.WARNING,
			);
			return;
		}

		drawerElement?.show();
	};
</script>

{#if isInitialize}
	<main class="relative w-full h-full">
		<div class="w-full h-full">
			<SvelteFlow {nodeTypes} {nodes} {edges} fitView>
				<Controls />
				<Background
					patternColor="#aaa"
					gap={16}
					class="border border-surface-300"
				/>
			</SvelteFlow>

			<slot name="run-button"></slot>

			<div
				class="w-full py-10 flex flex-col justify-start items-start gap-4"
			>
				{#each [...bflowviz.nodes].reverse() as node}
					{@const nodeResult = _.find(
						actionNodeResults,
						(result) => result.id === node.id,
					)}

					{@const isActionNode = node.type === "ACTION"}
					{@const state = node.data?.state}
					{@const isIdleNode = !state}

					{#if isActionNode && !isIdleNode}
						<div
							class="w-full card rounded-none bg-base-100 shadow-md p-4"
						>
							{#if node.name}
								<div class="font-bold">
									{node.name}
								</div>
							{/if}
							{#if node.description}
								<div class="text-sm text-surface-300">
									{node.description}
								</div>
							{/if}

							{#if nodeResult}
								<div class="mt-4">
									<WebComponentLoader
										tag={nodeResult.dynamicComponent?.tag}
										scriptBase64={nodeResult
											.dynamicComponent?.scriptBase64}
										propBindings={nodeResult
											.dynamicComponent?.propBindings}
										bindingData={nodeResult.bindingData}
									></WebComponentLoader>
								</div>
							{:else if state === BFlowNodeState.RUNNING || state === BFlowNodeState.WAITING_FOR_DATA}
								<div
									class="w-full rounded-none gap-4 p-4 flex justify-start items-center gap-1"
								>
									<LoadingIndicator></LoadingIndicator>
								</div>
							{:else if state === BFlowNodeState.SUCCESS}
								<div
									class="w-full text-success-500 gap-4 p-4 flex justify-start items-center gap-1"
								>
									<div>
										<p class="font-bold">Success</p>
									</div>
								</div>
							{:else if state === BFlowNodeState.FAILURE}
								<div
									class="w-full text-error-500 gap-4 p-4 flex justify-start items-center gap-1"
								>
									<TriangleAlert />
									<div>
										<p class="font-bold">Failed</p>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</main>
	<!-- <Drawer bind:this={drawerElement} position="right">
		{#snippet modalContent()}
			<RunNodeResult
				code={actionNodeResultToDisplay?.code}
				result={actionNodeResultToDisplay?.result}
			></RunNodeResult>
		{/snippet}
	</Drawer> -->
{/if}
