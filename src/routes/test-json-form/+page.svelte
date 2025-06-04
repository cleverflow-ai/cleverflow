<script lang="ts">
    import { onMount } from "svelte";
    import type {
        Task,
        TaskSendParams,
    } from "@cleverflow-ai/cleverflow.agents/schema";
    import { ConductorAgent } from "$lib/agents/ConductorAgent";

    onMount(async () => {
        await import(
            "@cleverflow-ai/cleverflow.core.frontend/webcomponents/json-form.js"
        );
    });

    const run = async () => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        const conductorAgent = new ConductorAgent(conductorServer);
        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [],
            },
            metadata: {
                taskName: "demo-json-form",
            },
        };
        conductorAgent.sendTask(taskParams, (event: Task) => {
            const state = event.status?.state;
            console.log(`state: ${state}`);
            if (state === "completed") {
                console.log(event);
            }
        });
    };
</script>

<json-form theme="crimson"></json-form>
<div>
    <button
        onclick={async () => await run()}
        class="btn preset-filled-success-500"
    >
        Run
    </button>
</div>
