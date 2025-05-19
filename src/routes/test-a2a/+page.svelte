<script lang="ts">
    import { A2AConductorClient } from "$lib/a2a/A2AConductorClient";
    import { onMount } from "svelte";

    let conductorClient: A2AConductorClient;

    onMount(() => {
        const conductorServer = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;
        console.log(`>>> conductorServer: ${conductorServer}`);
        conductorClient = new A2AConductorClient(conductorServer);
        conductorClient.sendTask({
            id: new Date().toISOString(),
            name: "hello a2a server",
        });
    });
</script>

<div>Hello A2A</div>
