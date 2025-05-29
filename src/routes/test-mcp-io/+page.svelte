<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
    import MarkdocRenderer from "$lib/components/MarkdocRenderer.svelte";
    import GlbViewer from "$lib/components/GlbViewer.svelte";
    import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
    import { z } from "zod";

    let baseUrl = $state("");
    let apiKey = $state("");

    // OUTLINE
    let fileId = $state("");

    // GITEA
    let repoOwner = $state("clevernow");
    let repo = $state("atlascopco-dasm");
    let filePath = $state("README.md");

    // RP
    let rpUsername = $state("");
    let rpPassword = $state("");
    let rpModelName = $state("");

    let currentForm = $state("glb-form");
    // let currentForm = $state("gitea-form");
    // let currentForm = $state("gitea-form");

    let isLoading = $state(false);

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
        baseUrl = "";
        apiKey = "";

        // OUTLINE
        fileId = "";
        // GITEA
        repoOwner = "";
        repo = "";
        filePath = "";

        // RP
        rpUsername = "";
        rpPassword = "";
        rpModelName = "";
    }

    async function fetchOutlineTextFile(): Promise<void> {
        if (!baseUrl || !apiKey || !fileId) {
            console.error("Please provide baseUrl, apiKey, and fileId.");
            return;
        }

        isLoading = true;

        const client = await createClient(
            "http://localhost:3000/mcp",
            "@cleverflow-ao/cleverflow.mcp.io",
            "1.0.0",
        );

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

        const result = await client.callTool(
            {
                name: "fetch-outline-text-file",
                arguments: {
                    fileId,
                    baseUrl,
                    apiKey,
                },
            },
            z.object({
                content: z.array(
                    z.object({
                        type: z.literal("text"),
                        text: z.string(),
                    }),
                ),
            }),
            {
                timeout: 3600 * 1000,
            },
        );

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

        isLoading = false;
    }

    async function fetchGiteaTextFile(): Promise<void> {
        if (!repoOwner || !repo || !filePath) {
            console.error("Please provide repoOwner, repo, and filePath.");
            return;
        }

        isLoading = true;

        const client = await createClient(
            "http://localhost:3000/mcp",
            "@cleverflow-ao/cleverflow.mcp.io",
            "1.0.0",
        );

        const result = await client.callTool(
            {
                name: "fetch-gitea-text-file",
                arguments: {
                    baseUrl,
                    apiKey,
                    repoOwner,
                    repo,
                    filePath,
                },
            },
            z.object({
                content: z.array(
                    z.object({
                        type: z.literal("text"),
                        text: z.string(),
                    }),
                ),
            }),
            {
                timeout: 3600 * 1000,
            },
        );
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

        isLoading = false;
    }

    async function convertStepToGlb(): Promise<void> {
        if (!rpUsername || !rpPassword || !rpModelName) {
            console.error(
                "Please provide rpUsername, rpPassword, and rpModelName.",
            );
            return;
        }

        isLoading = true;

        const client = await createClient(
            "http://localhost:4001/mcp",
            "@clevernow/clevernow.mcp.3d",
            "1.0.0",
        );

        const result = await client.callTool(
            {
                name: "convert-step-to-glb",
                arguments: {
                    rpUsername,
                    rpPassword,
                    rpModelName,
                },
            },
            z.object({
                content: z.array(
                    z.object({
                        type: z.literal("text"),
                        text: z.string(),
                        uri: z.string(),
                    }),
                ),
            }),
            {
                timeout: 3600 * 1000,
            },
        );

        const uri =
            result.content &&
            Array.isArray(result.content) &&
            result.content.length > 0
                ? result.content[0].uri
                : null;

        if (uri) {
            const fileResult = await client.request(
                {
                    method: "resources/read",
                    params: {
                        uri: uri,
                    },
                },
                z.object({
                    content: z.array(
                        z.object({
                            uri: z.string(),
                            data: z.string(),
                        }),
                    ),
                }),
                {
                    timeout: 3600 * 1000,
                },
            );

            const data =
                fileResult.content &&
                Array.isArray(fileResult.content) &&
                fileResult.content.length > 0
                    ? fileResult.content[0].data
                    : null;

            if (data) {
                results = [
                    {
                        baseUrl,
                        apiKey,
                        repoOwner,
                        repo,
                        filePath,
                        gblData: data,
                    },
                    ...results,
                ]; // Ensure results is an array
            }
        }

        isLoading = false;
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
                <option value="glb-form">convert-step-to-glb</option>
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
                    disabled={isLoading || !baseUrl || !apiKey || !fileId
                        ? true
                        : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        {:else if currentForm === "gitea-form"}
            <label class="label">
                <span class="label-text">Base URL</span>
                <input bind:value={baseUrl} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">API Key</span>
                <input bind:value={apiKey} type="text" class="input" />
            </label>
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
                    disabled={isLoading || !repoOwner || !repo || !filePath
                        ? true
                        : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        {:else if currentForm === "glb-form"}
            <label class="label">
                <span class="label-text">RP Username</span>
                <input bind:value={rpUsername} type="text" class="input" />
            </label>

            <label class="label">
                <span class="label-text">RP Password</span>
                <input bind:value={rpPassword} type="password" class="input" />
            </label>

            <label class="label">
                <span class="label-text">RP Model Name</span>
                <input bind:value={rpModelName} type="text" class="input" />
            </label>

            <div class="flex justify-end">
                <button
                    onclick={convertStepToGlb}
                    disabled={isLoading ||
                    !rpUsername ||
                    !rpPassword ||
                    !rpModelName
                        ? true
                        : false}
                    type="button"
                    class="btn btn-sm preset-filled-primary-500">Submit</button
                >
            </div>
        {/if}
    </form>

    <!-- Results List -->
    <div class="mx-auto w-full space-y-4">
        {#if isLoading}
            <LoadingIndicator size={40} />
        {/if}

        {#key results.length}
            {#each results as result}
                {#if result.gblData}
                    <GlbViewer base64Data={result.gblData}></GlbViewer>
                {:else if result.text}
                    <MarkdocRenderer doc={result.text}></MarkdocRenderer>
                {/if}
            {/each}
        {/key}

        {#if results.length === 0}
            <div class="text-center text-gray-500">No results yet.</div>
        {/if}
    </div>
</div>
