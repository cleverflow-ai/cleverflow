<script lang="ts">
    import { onMount } from "svelte";
    import { AgentConnection } from "../../../extensions/cleverflow.core/src/AgentConnection.js";
    import BFlowRunnerAgentMessenger from "../../../extensions/cleverflow.core.frontend/src/lib/bflow/agent/BFlowRunnerAgentMessenger.js";

    let agentConnection: AgentConnection;
    let bflowRunnerAgentMessenger: BFlowRunnerAgentMessenger;

    let container: any;

    onMount(async () => {
        agentConnection = new AgentConnection({ name: "bflow" });

        await agentConnection.connect({
            servers: "ws://localhost:8080",
            token: "76de3ba222bec3af21f9dbfb01f3197b",
        });

        bflowRunnerAgentMessenger = new BFlowRunnerAgentMessenger({
            connection: agentConnection,
        });

        const result = await bflowRunnerAgentMessenger.request({
            query: "loadGUI",
        });

        const binaryData = new Uint8Array(result.gui.buffer.data);
        const blob = new Blob([binaryData], {
            type: "application/javascript",
        });
        const moduleUrl = URL.createObjectURL(blob);

        await import(moduleUrl);
        console.log("Web component imported successfully!");

        // Step 1: Inject the web component into the DOM
        if (container) {
            let attributes = "";
            if (result.gui.attributes) {
                attributes = Object.entries(result.gui.attributes)
                    .map(([key, value]) => `${key}="${value}"`)
                    .join(" ");
            }
            container.innerHTML = `<${result.gui.webcomponent} ${attributes}></${result.gui.webcomponent}>`;
        }
    });
</script>

<main>
    <div>DEMO: Dynamic loading web component</div>
    <div bind:this={container}></div>
</main>
