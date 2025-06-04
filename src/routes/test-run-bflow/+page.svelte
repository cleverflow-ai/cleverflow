<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { ConductorAgent } from "$lib/agents/ConductorAgent";
    import type {
        Task,
        TaskSendParams,
    } from "@cleverflow-ai/cleverflow.agents/schema";
    import { onMount } from "svelte";
    import postal from "postal";

    let conductorAgent: ConductorAgent;

    let resultText = $state("");

    let completeFormModalState = $state(false);

    function completeFormModalClose() {
        completeFormModalState = false;
    }

    onMount(async () => {});

    const runBFlow = async () => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        conductorAgent = new ConductorAgent(conductorServer);
        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [
                    {
                        type: "data",
                        data: {
                            bflow: {
                                id: null,
                                name: null,
                                description: null,
                                root: {
                                    type: "ENTRY",
                                    id: "entry_1",
                                    name: null,
                                    description: null,
                                    config: null,
                                    state: null,
                                    goto: [
                                        {
                                            type: "SEQUENCE",
                                            id: "sequence_1",
                                            name: null,
                                            description: null,
                                            config: null,
                                            state: null,
                                            goto: [
                                                {
                                                    type: "ACTION",
                                                    id: "action_1",
                                                    name: "file-fetching",
                                                    description:
                                                        "Fetching a gitea file",
                                                    config: null,
                                                    state: null,
                                                    goto: null,
                                                    tool: {
                                                        name: "fetch-gitea-text-file",
                                                        description:
                                                            "Tool fetch-gitea-text-file from MCP client",
                                                    },
                                                    inputs: [],
                                                    output: {},
                                                },
                                                {
                                                    type: "ACTION",
                                                    id: "action_2",
                                                    name: "file-fetching",
                                                    description:
                                                        "Fetching a outline file",
                                                    config: null,
                                                    state: null,
                                                    goto: null,
                                                    tool: {
                                                        name: "fetch-outline-text-file",
                                                        description:
                                                            "Tool fetch-outline-text-file from MCP client",
                                                    },
                                                    inputs: [],
                                                    output: {},
                                                },
                                                {
                                                    type: "ACTION",
                                                    id: "action_3",
                                                    name: "file-convert",
                                                    description:
                                                        "Convert a steps file to glb",
                                                    config: null,
                                                    state: null,
                                                    goto: null,
                                                    tool: {
                                                        name: "convert-step-to-glb",
                                                        description:
                                                            "Tool convert-step-to-glb from MCP client",
                                                    },
                                                    inputs: [],
                                                    output: {},
                                                },
                                            ],
                                            tool: null,
                                            inputs: [],
                                            output: {},
                                        },
                                    ],
                                    tool: null,
                                    inputs: [],
                                    output: {},
                                },
                            },
                        },
                    },
                ],
            },
            metadata: {
                taskName: "run-bflow",
            },
        };
        conductorAgent.sendTask(taskParams, (event: Task) => {
            console.log(event);
        });
    };
</script>

<!-- <json-form theme="crimson"></json-form> -->
<div>
    <button
        onclick={async () => await runBFlow()}
        class="btn preset-filled-success-500"
    >
        Run BFlow
    </button>
</div>
