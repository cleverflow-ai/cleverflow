<script>
    import { onMount } from 'svelte';
    import * as m from '$lib/paraglide/messages.js';

    onMount(async () => {
        await import('@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js');
        await import('@cleverflow/cleverflow.core/webcomponents/b-flow.js');
    });
</script>

<h1>{m.welcome_to_cleverflow()}</h1>

<markdoc-editor name="mydoc.mdoc"></markdoc-editor>
<b-flow url="https://cleverflow.ai/files/dummy.mdoc" text="example mdoc with b-flow custom element."></b-flow>