<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        const runningBflowResult = {
            bflow: {
                id: null,
                name: null,
                description: null,
                root: {
                    type: "SEQUENCE",
                    id: "select-baking-machines",
                    name: null,
                    description: null,
                    config: null,
                    state: null,
                    goto: [
                        {
                            type: "ACTION",
                            id: "action_upload_file",
                            name: "upload-file",
                            description: null,
                            config: null,
                            state: "WAITING_FOR_CLIENT",
                            goto: null,
                            agent: {
                                name: "js-v8-code-generation",
                                description:
                                    "Generate Javascript (V8) code for executing Task ad hoc.\nCan be used as default Agent.",
                            },
                            inputs: [],
                            output: {},
                        },
                        {
                            type: "ACTION",
                            id: "action_read_file",
                            name: "read-file",
                            description: "Read data from uploaded file.",
                            config: null,
                            state: null,
                            goto: null,
                            agent: {
                                name: "js-v8-code-generation",
                                description:
                                    "Generate Javascript (V8) code for executing Task ad hoc.\nCan be used as default Agent.",
                            },
                            inputs: ["action_upload_file"],
                            output: {},
                        },
                        {
                            type: "ACTION",
                            id: "action_save_file_to_gitea",
                            name: "save-file",
                            description: "Save data to gitea",
                            config: null,
                            state: null,
                            goto: null,
                            agent: {
                                name: "js-v8-code-generation",
                                description:
                                    "Generate Javascript (V8) code for executing Task ad hoc.\nCan be used as default Agent.",
                            },
                            inputs: ["action_read_file"],
                            output: {},
                        },
                        {
                            type: "ACTION",
                            id: "action_save_file_to_duckdb",
                            name: "save-file",
                            description: "Save data to duckdb",
                            config: null,
                            state: null,
                            goto: null,
                            agent: {
                                name: "js-v8-code-generation",
                                description:
                                    "Generate Javascript (V8) code for executing Task ad hoc.\nCan be used as default Agent.",
                            },
                            inputs: ["action_read_file"],
                            output: {},
                        },
                    ],
                    agent: null,
                    inputs: [],
                    output: {},
                },
            },
            outs: {},
        };
        const clientActionRequiredNode = findClientActionRequiredNode(
            runningBflowResult.bflow.root,
        );
        console.log(clientActionRequiredNode);
        if (clientActionRequiredNode) {
            doActionRequired(clientActionRequiredNode);
        }
    });
    const findClientActionRequiredNode = (node: any): any => {
        console.log(node);
        if (node.state === "WAITING_FOR_CLIENT") {
            return node;
        }
        if (node.goto && node.goto.length > 0) {
            for (let i = 0; i < node.goto.length; i++) {
                const foundNode = findClientActionRequiredNode(node.goto[i]);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    };

    const doActionRequired = (node: any) => {
        alert(node.name);
    };
</script>
