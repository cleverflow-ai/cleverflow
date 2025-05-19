<script>
    import { onMount } from "svelte";

    onMount(async () => {
        await import(
            "@cleverflow/cleverflow.core.frontend/webcomponents/json-form.js"
        );
    });
</script>

<json-form theme="crimson"></json-form>
