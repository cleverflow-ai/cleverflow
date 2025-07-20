<script lang="ts">
    import { onMount } from "svelte";
    import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
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

    // let currentForm = $state("glb-form");
    let currentForm = $state("gitea-form");

    let isLoading = $state(false);

    let results: any[] = $state([]);

    let dynamicComponent: any = $state(null);
    let bindingData: any = $state(null);

    onMount(async () => {
        setDefaultForm();
        // await import(
        //     "@cleverflow-ai/cleverflow.core.frontend/webcomponents/web-component-loader.js"
        // );
    });

    function setDefaultForm(): void {
        baseUrl = "https://gitea-atlascopco-integration.clevernow.com/api/v1";
        apiKey = "04f4b0dada8fa8632dc7541f2f2131c703693e7e";

        // OUTLINE
        fileId = "";
        // GITEA
        repoOwner = "clevernow";
        repo = "atlascopco-dasm";
        filePath = "README.md";
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

        const client = await createMcpClient(
            "http://localhost:3000/mcp",
            "@cleverflow-ao/cleverflow.mcp.io",
            "1.0.0",
        );

        const result = await client.callTool(
            {
                name: "fetch-outline-text-file",
                arguments: {
                    fileId,
                    baseUrl,
                    apiKey,
                },
            },
            CompatibilityCallToolResultSchema,
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
        if (!repoOwner || !repo) {
            console.error("Please provide repoOwner, repo, and filePath.");
            return;
        }

        isLoading = true;

        try {
            const client = await createMcpClient(
                "http://localhost:3000/mcp",
                // "http://llms.clevernow.com:8031/mcp",
                "@cleverflow-ao/cleverflow.mcp.io",
                "1.0.0",
                {
                    mcpSessionId: new Date().toISOString(),
                },
            );
            // const list = await client.listTools();
            // console.log(JSON.stringify(list));
            // const result = await client.callTool(
            //     {
            //         name: "get_file_contents",
            //         arguments: {
            //             url: baseUrl,
            //             token: apiKey,
            //             branch: "main",
            //             owner: repoOwner,
            //             repo,
            //             path: filePath ?? "",
            //         },
            //     },
            //     z.any(),
            //     {
            //         timeout: 3600 * 1000,
            //     },
            // );

            const result = await client.callTool(
                {
                    name: "list_repository_files",
                    arguments: {
                        url: baseUrl,
                        token: apiKey,
                        branch: "main",
                        owner: repoOwner,
                        repo,
                        pattern:
                            "orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/*.pdf",
                    },
                },
                z.any(),
                {
                    timeout: 3600 * 1000,
                },
            );
            console.log(">>> result: ");
            console.log(result);
            const content =
                result.content &&
                Array.isArray(result.content) &&
                result.content.length > 0
                    ? result.content[0]
                    : null;
            console.log(content);
            if (content) {
                bindingData = content.resource;
                dynamicComponent = content.resource?.dynamicComponent;
                const decoder = new TextDecoder("utf-8");
                const str = decoder.decode(
                    new Uint8Array(content.resource.bytes),
                );
                console.log(`str: ${str}`);
            }
        } catch (exception: any) {
            console.log(exception);
            console.log(exception.message);
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

        const client = await createMcpClient(
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
            CompatibilityCallToolResultSchema,
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
                    disabled={isLoading || !repoOwner || !repo ? true : false}
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

{#if dynamicComponent}
    <web-component-loader
        tag={dynamicComponent.tag}
        scriptBase64={dynamicComponent.scriptBase64}
        propBindings={dynamicComponent.propBindings}
        {bindingData}
    >
    </web-component-loader>
{/if}
