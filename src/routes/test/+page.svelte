<script lang="ts">
    import { onMount } from "svelte";
    import { add } from "./CompnentA.svelte";

    const eventServer = "ws://localhost:8080";
    const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

    onMount(async () => {
        await import(
            "@cleverflow/cleverflow.core/webcomponents/file-uploader.js"
        );
    });
</script>

<!-- {@render add()} -->
<file-uploader
    servers="ws://localhost:8080"
    token="76de3ba222bec3af21f9dbfb01f3197b"
></file-uploader>
