<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from "@cleverflow-ai/cleverflow.mcp.io/dist/client.js";
    import MarkdocRenderer from "$lib/components/MarkdocRenderer.svelte";

    let baseUrl = $state("https://docs-atlascopco.clevernow.com/api");
    let apiKey = $state("ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO");
    let fileId = $state("sealing-technologies-rrOT5m2iSz");

    let repoOwner = $state("clevernow");
    let repo = $state("atlascopco-dasm");
    let filePath = $state("README.md");

    let currentForm = $state("outline-form");
    // let currentForm = $state("gitea-form");

    const results: any[] = $state([]);

    onMount(async () => {
        // const jsonForm = `{
        //     "type": "object",
        //     "properties": {
        //         "name": {
        //             "type": "string",
        //             "title": "Name"
        //         },
        //         "email": {
        //             "type": "string",
        //             "title": "Email"
        //         },
        //         "message": {
        //             "type": "string",
        //             "title": "Message"
        //         }
        //     },
        //     "required": ["name", "email", "message"]
        // }` //await guiAgent.runTask(`generate-json-form`, `Please help me generate a .. with three text fields for ...`);
    });

    async function fetchOutlineTextFile(): Promise<void> {
        if (!baseUrl || !apiKey || !fileId) {
            console.error("Please provide baseUrl, apiKey, and fileId.");
            return;
        }

        const client = await createClient("http://localhost:3000/mcp");

        // // List resources
        // const resources = await client.listResources();
        // console.log("Resources:", resources);
        // // Read a resource
        // const resource = await client.readResource({
        //     uri: `outline://${fileId}`,
        //     arguments: {
        //         fileId,
        //         baseUrl,
        //         apiKey,
        //     },
        // });
        // console.log('Resource:', resource);
        // console.log('Text:', resource.contents[0].text);

        // List tools
        // const tools = await client.listTools();
        // console.log("Tools:", tools);

        const result = await client.callTool({
            name: "fetch-outline-text-file",
            arguments: {
                fileId,
                baseUrl,
                apiKey,
                // fileId: "sealing-technologies-rrOT5m2iSz",
                // baseUrl: "https://docs-atlascopco.clevernow.com/api",
                // apiKey: "ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO",
            },
        });
        console.log("Result:", result);
        const text =
            result.content &&
            Array.isArray(result.content) &&
            result.content.length > 0
                ? result.content[0].text
                : null;
        if (text) {
            results.push({
                fileId,
                baseUrl,
                apiKey,
                text,
            });
        }
        fileId = ""; // Clear fileId after fetching
        baseUrl = ""; // Clear baseUrl after fetching
        apiKey = ""; //
    }
</script>

<div class="max-w-2xl mx-auto p-4 space-y-6">
    <!-- Form -->
    {#if currentForm === "outline-form"}
        <form class="mx-auto w-full space-y-4 card bg-base-100 shadow-md p-4">
            <label class="label">
                <span class="label-text">Base URL</span>
                <input bind:value={baseUrl} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">API Key</span>
                <input bind:value={apiKey} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">File ID</span>
                <input bind:value={fileId} type="text" class="input" />
            </label>

            <div class="flex justify-end">
                <button
                    onclick={fetchOutlineTextFile}
                    disabled={!baseUrl || !apiKey || !fileId ? true : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        </form>
    {:else if currentForm === "gitea-form"}
        <form class="mx-auto w-full space-y-4 card bg-base-100 shadow-md p-4">
            <label class="label">
                <span class="label-text">Base URL</span>
                <input bind:value={baseUrl} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">API Key</span>
                <input bind:value={apiKey} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">File ID</span>
                <input bind:value={fileId} type="text" class="input" />
            </label>

            <div class="flex justify-end">
                <button
                    onclick={fetchOutlineTextFile}
                    disabled={!baseUrl || !apiKey || !fileId ? true : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        </form>
    {/if}

    <!-- Results List -->
    <div class="mx-auto w-full space-y-4">
        {#each results as result, i (i)}
            <MarkdocRenderer doc={result.text}></MarkdocRenderer>
        {/each}
    </div>
</div>
