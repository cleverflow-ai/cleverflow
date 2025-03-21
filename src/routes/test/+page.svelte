<script lang="ts">
    import { onMount } from "svelte";
    import FileUploader from "../../../extensions/cleverflow.agents.fileuploader/gui/src/lib/FileUploader.svelte";

    const eventServer = "ws://localhost:8080";
    const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

    onMount(async () => {});
</script>

<FileUploader servers={eventServer} token={eventServerToken}></FileUploader>
