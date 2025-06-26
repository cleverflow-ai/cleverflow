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
	import MarkdocRenderer from "../../common/components/MarkdocRenderer.svelte";
	import LoadingIndicator from "../../common/components/LoadingIndicator.svelte";
	import { TriangleAlert } from "lucide-svelte";

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
					const firstContent = data.content[0];
					if (firstContent.type === "text") {
						actionNodeResults.push({
							id: key,
							type: firstContent.type,
							text: firstContent.text,
						});
					} else if (firstContent.type === "file") {
						const path = firstContent.uri.replace(/\\/g, "/"); // Normalize Windows-style slashes
						const filename = path.split("/").pop(); // Get '89971.000001.glb'
						const ext = filename.includes(".")
							? filename.split(".").pop().toLowerCase()
							: "";
						actionNodeResults.push({
							id: key,
							type: firstContent.type,
							text: firstContent.text,
							uri: firstContent.uri,
							ext: ext,
						});
					}
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
				<Background patternColor="#aaa" gap={16} />
			</SvelteFlow>
			<div class="py-10 flex flex-col gap-6 justify-start items-start">
				<div class="flex flex-col justify-start items-start gap-1">
					{#each [...bflowviz.nodes].reverse() as node}
						{@const nodeResult = _.find(
							actionNodeResults,
							(result) => result.id === node.id,
						)}

						{@const isActionNode = node.type === "ACTION"}
						{@const state = node.data?.state}
						{@const isIdleNode = !state}

						{#if isActionNode && !isIdleNode && node.name}
							<div class="font-bold">
								{node.name}
							</div>
						{/if}

						{#if isActionNode && !isIdleNode && node.description}
							<div class="text-sm">
								{node.description}
							</div>
						{/if}
						{#if isActionNode && state === BFlowNodeState.FAILURE}
							<div
								class="w-full card p-4 bg-base-100 shadow-md rounded-none gap-4 p-4 flex justify-start items-center gap-1"
							>
								<TriangleAlert />
								<div>
									<p class="font-bold">Failed</p>
								</div>
							</div>
						{:else if isActionNode && (state === BFlowNodeState.RUNNING || state === BFlowNodeState.WAITING_FOR_DATA)}
							<div
								class="w-full card p-4 bg-base-100 shadow-md rounded-none gap-4 p-4 flex justify-start items-center gap-1"
							>
								<LoadingIndicator></LoadingIndicator>
							</div>
						{:else if nodeResult && nodeResult.type === "file" && nodeResult.uri && ["glb"].includes(nodeResult.ext)}
							<MarkdocRenderer doc={nodeResult.text}
							></MarkdocRenderer>
						{:else if nodeResult && nodeResult.type === "text"}
							<MarkdocRenderer doc={nodeResult.text}
							></MarkdocRenderer>
						{:else if isActionNode && state === BFlowNodeState.SUCCESS}
							<div
								class="w-full card p-4 bg-base-100 shadow-md rounded-none gap-4 p-4 flex justify-start items-center gap-1"
							>
								<div>
									<p class="font-bold">Success</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</main>
	<Drawer bind:this={drawerElement} position="right">
		{#snippet modalContent()}
			<RunNodeResult
				code={actionNodeResultToDisplay?.code}
				result={actionNodeResultToDisplay?.result}
			></RunNodeResult>
		{/snippet}
	</Drawer>
{/if}
