<script lang="ts">
    import { ConductorAgent } from "$lib/agents/ConductorAgent";
    import type { TaskSendParams } from "@cleverflow/cleverflow.agents/schema";
    import { onMount } from "svelte";
    import postal from "postal";
    let conductorAgent: ConductorAgent;

    onMount(async () => {
        window.postal = postal;
        await import(
            "@cleverflow/cleverflow.core.frontend/webcomponents/json-form.js"
        );
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
                taskName: "read-file",
                // input: {
                //     fileUrl: "https://gitea.clevernow.com/files/demo.md",
                // },
            },
        };
        conductorAgent.sendTask(taskParams);
    });
</script>

<div>Hello A2A</div>
<json-form theme="crimson"></json-form>
