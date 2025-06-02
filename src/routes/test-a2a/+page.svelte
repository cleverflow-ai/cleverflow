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

    onMount(async () => {
        window.postal = postal;
        // await import(
        //     "@cleverflow-ai/cleverflow.core.frontend/webcomponents/json-form.js"
        // );
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        conductorAgent = new ConductorAgent(conductorServer);
        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [],
            },
            metadata: {
                taskName: "text-to-bflow",
                input: {
                    text: `
                        {% b-flow id="cleverflow-mcp-a2a" %}
                            {% sequence %}                    
                                {% gitea-file-fetching id="action_1" %}
                                    Fetching a gitea file
                                {% /gitea-file-fetching %}

                                {% outline-file-fetching id="action_2" %}
                                    Fetching a outline file
                                {% /outline-file-fetching %}

                                {% convert-steps-to-glb id="action_3" %}
                                    Convert a steps file to glb
                                {% /convert-steps-to-glb %}
                            {% /sequence %}
                        {% /b-flow %}
                    `,
                },
            },
        };
        conductorAgent.sendTask(taskParams, (event: Task) => {
            resultText = JSON.stringify(event);
            completeFormModalState = true;
        });
    });
</script>

<!-- <json-form theme="crimson"></json-form> -->
<Modal
    open={completeFormModalState}
    onOpenChange={(e) => (completeFormModalState = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <article>
            <p class="opacity-60">
                {resultText}
            </p>
        </article>
        <footer class="flex justify-end gap-4">
            <button
                type="button"
                class="btn preset-tonal"
                onclick={completeFormModalClose}>Close</button
            >
        </footer>
    {/snippet}
</Modal>
