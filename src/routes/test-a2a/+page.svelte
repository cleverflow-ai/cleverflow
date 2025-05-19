<script lang="ts">
    import { ConductorAgent } from "$lib/agents/ConductorAgent";
    import { onMount } from "svelte";

    let conductorAgent: ConductorAgent;

    onMount(() => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        conductorAgent = new ConductorAgent(conductorServer);
        conductorAgent.sendTask({
            id: new Date().toISOString(),
            name: "hello a2a server",
        });
    });
</script>

<div>Hello A2A</div>
