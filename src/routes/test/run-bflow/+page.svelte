<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { InteractiveClient } from "@cleverflow-ai/cleverflow.agents.interactiveclient";
    import type {
        Task,
        TaskSendParams,
        TaskState,
    } from "@cleverflow-ai/cleverflow.agents/schema";

    import { onMount } from "svelte";
    import postal from "postal";

    let conductorClient: InteractiveClient;

    let resultText = $state("");

    const bflow = {
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
                            name: "task-1",
                            description: "Fetching a gitea file",
                            config: null,
                            state: null,
                            goto: null,
                            tool: {
                                name: "get_file_contents",
                                description:
                                    "Tool get_file_contents from MCP client",
                            },
                            inputs: [],
                            output: {},
                        },
                        {
                            type: "ACTION",
                            id: "action_2",
                            name: "task-2",
                            description: "Fetching a outline file",
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
                            name: "task-3",
                            description: "Convert a steps file to glb",
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
                    inputs: null,
                    output: {},
                },
            ],
            tool: null,
            inputs: null,
            output: {},
        },
    };

    let completeFormModalState = $state(false);

    function completeFormModalClose() {
        completeFormModalState = false;
    }

    onMount(async () => {
        await import(
            "@cleverflow-ai/cleverflow.core.frontend/webcomponents/json-form.js"
        );
    });

    const runBFlow = async () => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        conductorClient = new InteractiveClient(conductorServer);
        console.log(bflow.root.id);
        const taskParams: TaskSendParams = {
            id: `empty-dataId|single-session|run-bflow`,
            message: {
                role: "user",
                parts: [
                    {
                        type: "data",
                        data: {
                            bflow,
                        },
                    },
                ],
            },
        };
        conductorClient.sendTask(
            taskParams,
            (state: TaskState, event: Task) => {
                console.log(event);
            },
        );
    };
</script>

<json-form theme="crimson"></json-form>
<div>
    <button
        onclick={async () => await runBFlow()}
        class="btn preset-filled-success-500"
    >
        Run BFlow
    </button>
</div>
