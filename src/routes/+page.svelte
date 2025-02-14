<script>
    import { onMount } from 'svelte';
    import * as m from '$lib/paraglide/messages.js';

    onMount(async () => {
        await import('@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js');
    });
</script>

<h1>{m.welcome_to_cleverflow()}</h1>

<markdoc-editor name="mydoc.mdoc"></markdoc-editor>