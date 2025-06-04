<script lang="ts">
    import { onMount } from "svelte";
    import type {
        Task,
        TaskSendParams,
    } from "@cleverflow-ai/cleverflow.agents/schema";
    import { ConductorAgent } from "$lib/agents/ConductorAgent";

    import { SimpleForm } from "@sjsf/form";
    import { resolver } from "@sjsf/form/resolvers/basic";
    import { translation } from "@sjsf/form/translations/en";
    import { theme } from "@sjsf/skeleton3-theme";

    let inputSchema = {
        type: "object",
        properties: {
            baseUrl: {
                type: "string",
            },
            apiKey: {
                type: "string",
            },
            repoOwner: {
                type: "string",
            },
            repo: {
                type: "string",
            },
            filePath: {
                type: "string",
            },
        },
        required: ["baseUrl", "apiKey", "repoOwner", "repo", "filePath"],
        additionalProperties: false,
        $schema: "http://json-schema.org/draft-07/schema#",
    };

    let jsonForm: any = $state();

    onMount(async () => {
        // await import(
        //     "@cleverflow-ai/cleverflow.core.frontend/webcomponents/json-form.js"
        // );
    });

    const run = async () => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        const conductorAgent = new ConductorAgent(conductorServer);
        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [
                    {
                        type: "data",
                        data: {
                            inputSchema,
                        },
                    },
                ],
            },
            metadata: {
                taskName: "schema-to-json-form",
            },
        };
        conductorAgent.sendTask(taskParams, (event: Task) => {
            const state = event.status?.state;
            console.log(`state: ${state}`);
            if (state === "completed") {
                const partData = event.status?.message?.parts?.find(
                    (part) => part.type === "data",
                );
                jsonForm = partData?.data?.jsonForm;
            }
        });
    };
</script>

<!-- <json-form theme="crimson"></json-form> -->
<div>
    <button
        onclick={async () => await run()}
        class="btn preset-filled-success-500"
    >
        Run
    </button>
</div>

{#if jsonForm}
    <SimpleForm
        {theme}
        {translation}
        {resolver}
        schema={jsonForm}
        validator={{ isValid: () => true }}
        onSubmit={(v: { text: string }) => window.alert(v.text)}
    />
{/if}
