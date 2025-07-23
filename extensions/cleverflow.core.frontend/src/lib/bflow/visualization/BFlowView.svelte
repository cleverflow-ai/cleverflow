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
	import { TriangleAlert, Check, Clock } from "lucide-svelte";
	import { WebComponentLoader } from "../../webcomponentloader/WebComponentLoader.js";
	import { JsonView } from "@zerodevx/svelte-json-view";
	import { format } from "date-fns";
	import { enUS } from "date-fns/locale";

	const channel = postal.channel("b-flow-view");

	const { bflowRunResult, bflowviz } = $props();

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
		if (bflowviz) {
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
		}

		isInitialize = true;

		// for (const key in bflowRunResult) {
		// 	if (bflowRunResult.hasOwnProperty(key)) {
		// 		const data = bflowRunResult[key];
		// 		const nodeResult: any = {
		// 			id: key,
		// 		};
		// 		if (
		// 			data.content &&
		// 			Array.isArray(data.content) &&
		// 			data.content.length > 0
		// 		) {
		// 			const content = data.content[0];
		// 			nodeResult.bindingData = content.resource;
		// 			nodeResult.dynamicComponent =
		// 				content.resource?.dynamicComponent;
		// 		}
		// 		actionNodeResults.push(nodeResult);
		// 	}
		// }
	});

	onDestroy(() => {
		showRunNodeResultSubscriber.unsubscribe();
	});

	const showRunNodeResult = (nodeId: string) => {
		if (!bflowRunResult) {
			addToast(
				"BFlow has not been run yet. Please run it first.",
				ToastType.WARNING,
			);
			return;
		}

		actionNodeResultToDisplay = bflowRunResult[nodeId];

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
		{#if bflowviz}
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
						{@const nodeResult = bflowRunResult[node.id]}
						{@const content = _.find(
							nodeResult.content,
							(content: any) => {
								return (
									content &&
									content.type === "resource" &&
									content.resource
								);
							},
						)}

						{@const isActionNode = node.type === "ACTION"}
						{@const state = node.data?.state}
						{@const isIdleNode = !state}

						{#if isActionNode && !isIdleNode}
							<div
								class="w-full card rounded-none bg-base-100 shadow-lg border border-surface-50-950 p-4 flex flex-col justify-start items-start gap-3"
							>
								{#if node.name}
									<div
										class="w-full flex justify-start items-center gap-2"
									>
										<span class="flex-1 font-bold"
											>{node.name}</span
										>
										{#if state === BFlowNodeState.SUCCESS}
											<span
												class="badge-icon preset-filled-success-500"
											>
												<Check size={16} />
											</span>
										{:else if state === BFlowNodeState.FAILURE}
											<span
												class="badge-icon preset-filled-error-500"
											>
												<TriangleAlert size={16} />
											</span>
										{/if}
									</div>
								{/if}

								{#if node.description}
									<div class="text-xs text-surface-300">
										{node.description}
									</div>
								{/if}

								<!-- Datetime | resultLink -->
								<div
									class="flex justify-start items-center gap-2"
								>
									{#if nodeResult && nodeResult.finishedAt}
										<div
											class="flex justify-start items-center gap-1"
										>
											<Clock size={16} />
											<span
												>{format(
													new Date(
														nodeResult.finishedAt,
													),
													"Pp",
													{ locale: enUS },
												)}</span
											>
										</div>
										{#if nodeResult.resultLink}
											<div class="font-bold">|</div>
										{/if}
									{/if}
									{#if nodeResult && nodeResult.resultLink}
										<a
											class="text-primary-500"
											href={nodeResult.resultLink}
											target="_blank">Result Link</a
										>
									{/if}
								</div>

								{#if nodeResult}
									<div
										class="w-full mt-4 flex flex-col justify-start items-start gap-3"
									>
										{#if content && content.resource?.dynamicComponent}
											{@const dynamicComponent =
												content.resource
													?.dynamicComponent}
											<WebComponentLoader
												tag={dynamicComponent?.tag}
												scriptBase64={dynamicComponent?.scriptBase64}
												propBindings={dynamicComponent?.propBindings}
												bindingData={content.resource}
											></WebComponentLoader>
										{:else if state === BFlowNodeState.SUCCESS}
											<div class="w-full overflow-x-auto">
												<JsonView json={nodeResult} />
											</div>
										{:else if state === BFlowNodeState.FAILURE}
											<div
												class="w-full flex justify-start items-center gap-4 p-4"
											>
												<TriangleAlert />
												<p>{node.stateMessage}</p>
											</div>
											<div class="w-full overflow-x-auto">
												<JsonView json={nodeResult} />
											</div>
										{/if}
									</div>
								{:else if state === BFlowNodeState.RUNNING || state === BFlowNodeState.WAITING_FOR_DATA}
									<LoadingIndicator></LoadingIndicator>
								{:else if state === BFlowNodeState.SUCCESS && nodeResult}
									<div class="w-full overflow-x-auto">
										<JsonView json={nodeResult} />
									</div>
								{:else if state === BFlowNodeState.FAILURE}
									<div
										class="w-full flex justify-start items-center gap-4 p-4"
									>
										<TriangleAlert />
										<p>Failed</p>
									</div>
									{#if nodeResult}
										<div class="w-full overflow-x-auto">
											<JsonView json={nodeResult} />
										</div>
									{/if}
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
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
			</div>
		{/if}
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
