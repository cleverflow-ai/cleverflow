<script lang="ts">
  import { onMount } from "svelte";
  import FileController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/file-controller.js";
  import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
  import { z } from "zod";

  let client: any;
  const baseUrl = "https://gitea-atlascopco-integration.clevernow.com/api/v1";
  const apiKey = "04f4b0dada8fa8632dc7541f2f2131c703693e7e";
  const repoOwner = "clevernow";
  const repo = "atlascopco-dasm";

  let fileController: FileController | null = $state(null);

  onMount(async () => {
    client = await createMcpClient(
      "http://localhost:3000/mcp",
      "@cleverflow-ao/cleverflow.mcp.io",
      "1.0.0",
    );
    await import(
      "@cleverflow-ai/cleverflow.core.frontend/webcomponents/file-tree.js"
    );

    fileController = new FileController(fetchFolderChildren, fetchFileContent);
    fileController.tree = {
      id: "1",
      name: "root",
      path: "",
      type: "folder",
    };
  });

  const fetchFolderChildren = async (node: any) => {
    const callToolResult = await client?.callTool(
      {
        name: "fetch-gitea",
        arguments: {
          baseUrl,
          apiKey,
          repoOwner,
          repo,
          filePath: node?.path ?? "",
        },
      },
      z.any(),
      {
        timeout: 3600 * 1000,
      },
    );
    const content =
      callToolResult.content &&
      Array.isArray(callToolResult.content) &&
      callToolResult.content.length > 0
        ? callToolResult.content[0]
        : null;
    if (content) {
      if (content.type === "data" && Array.isArray(content.data)) {
        return content.data.map((item: any) => ({
          id: item.sha,
          name: item.name,
          type: item.type === "dir" ? "folder" : "file",
          path: item.path,
        }));
      } else if (content.type === "text" && content.text) {
        return content.text;
      }
    }
    return null;
  };

  const fetchFileContent = async (node: any) => {};
</script>

{#if fileController}
  <file-tree controller={fileController}></file-tree>
{/if}
