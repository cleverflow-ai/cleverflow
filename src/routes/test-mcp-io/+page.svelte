<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from "@cleverflow-ai/cleverflow.mcp.io/dist/client.js";
    import MarkdocRenderer from "$lib/components/MarkdocRenderer.svelte";

    let baseUrl = $state("https://docs-atlascopco.clevernow.com/api");
    let apiKey = $state("ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO");

    // OUTLINE
    let fileId = $state("sealing-technologies-rrOT5m2iSz");

    // GITEA
    let repoOwner = $state("clevernow");
    let repo = $state("atlascopco-dasm");
    let filePath = $state("README.md");

    let currentForm = $state("gitea-form");
    // let currentForm = $state("gitea-form");

    let results: any[] = $state([]);

    onMount(async () => {
        setDefaultForm();
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

    function setDefaultForm(): void {
        if (currentForm === "outline-form") {
            apiKey = "ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO"; // Clear apiKey for Outline form
            baseUrl = "https://docs-atlascopco.clevernow.com/api"; // Clear baseUrl for Outline form
            fileId = "sealing-technologies-rrOT5m2iSz"; // Clear fileId for Outline form
        } else if (currentForm === "gitea-form") {
            apiKey = "04f4b0dada8fa8632dc7541f2f2131c703693e7e"; // Clear apiKey for Gitea form
            baseUrl =
                "https://gitea-atlascopco-integration.clevernow.com/api/v1"; // Clear baseUrl for Gitea form
            repoOwner = "clevernow"; // Clear repoOwner for Gitea form
            repo = "atlascopco-dasm"; // Clear repo for Gitea form
            filePath = "README.md"; // Clear filePath for Gitea form
        }
    }

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
            results = [
                {
                    fileId,
                    baseUrl,
                    apiKey,
                    text,
                },
                ...results,
            ];
        }
        console.log(results);
        // fileId = ""; // Clear fileId after fetching
        // baseUrl = ""; // Clear baseUrl after fetching
        // apiKey = ""; //
    }

    async function fetchGiteaTextFile(): Promise<void> {
        if (!repoOwner || !repo || !filePath) {
            console.error("Please provide repoOwner, repo, and filePath.");
            return;
        }

        const client = await createClient("http://localhost:3000/mcp");

        const result = await client.callTool({
            name: "fetch-gitea-text-file",
            arguments: {
                baseUrl,
                apiKey,
                repoOwner,
                repo,
                filePath,
            },
        });
        const text =
            result.content &&
            Array.isArray(result.content) &&
            result.content.length > 0
                ? result.content[0].text
                : null;
        if (text) {
            results = [
                {
                    baseUrl,
                    apiKey,
                    repoOwner,
                    repo,
                    filePath,
                    text,
                },
                ...results,
            ]; // Ensure results is an array
        }
    }
</script>

<div class="max-w-2xl mx-auto p-4 space-y-6">
    <form class="mx-auto w-full space-y-4 card bg-base-100 shadow-md p-4">
        <label class="label">
            <span class="label-text">Source File</span>
            <select
                bind:value={currentForm}
                onchange={setDefaultForm}
                class="select select-bordered w-full max-w-xs"
            >
                <option value="outline-form">Outline Text File</option>
                <option value="gitea-form">Gitea Text File</option>
            </select>
        </label>

        {#if currentForm === "outline-form"}
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
        {:else if currentForm === "gitea-form"}
            <label class="label">
                <span class="label-text">Repo Owner</span>
                <input bind:value={repoOwner} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">Repo</span>
                <input bind:value={repo} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">File Path</span>
                <input bind:value={filePath} type="text" class="input" />
            </label>

            <div class="flex justify-end">
                <button
                    onclick={fetchGiteaTextFile}
                    disabled={!repoOwner || !repo || !filePath ? true : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        {/if}
    </form>

    <!-- Results List -->
    <div class="mx-auto w-full space-y-4">
        {#key results.length}
            {#each results as result}
                <MarkdocRenderer doc={result.text}></MarkdocRenderer>
            {/each}
        {/key}

        {#if results.length === 0}
            <div class="text-center text-gray-500">No results yet.</div>
        {/if}
    </div>
</div>
