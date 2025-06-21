<script lang="ts">
    let { session } = $props();
</script>

<div class="flex justify-center">
    <div class="p-6 w-[90%] max-w-md space-y-4">
        <h2 class="text-lg font-semibold mb-2">Settings</h2>

        <div class="space-y-2">
            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium mb-1"
                    >MCP.IO Server</label
                >
                <input
                    type="text"
                    bind:value={session.mcpServerUrl}
                    class="w-full border px-2 py-1"
                />
            </div>
            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium mb-1">URL</label>
                <input
                    type="text"
                    bind:value={session.url}
                    class="w-full border px-2 py-1"
                />
                <div class="text-sm text-surface-300">
                    Gitea API or Github MCP Server
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Token</label>
                <input
                    type="password"
                    bind:value={session.token}
                    class="w-full border px-2 py-1"
                />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Branch</label>
                <input
                    type="text"
                    bind:value={session.branch}
                    class="w-full border px-2 py-1"
                />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Owner</label>
                <input
                    type="text"
                    bind:value={session.owner}
                    class="w-full border px-2 py-1"
                />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Repo</label>
                <input
                    type="text"
                    bind:value={session.repo}
                    class="w-full border px-2 py-1"
                />
            </div>
        </div>
    </div>
</div>
