<script lang="ts">
    import { onMount } from "svelte";

    let markdoc = `
This is only for reading
{% agents %}
    W3sibmFtZSI6Im1hcmtkb2MtY3VzdG9tLWVsZW1lbnQtdG8tYmZsb3ciLCJkZXNjcmlwdGlvbiI6IlBhcnNlIGdpdmVuIE1hcmtkb2MgQ3VzdG9tZSBFbGVtZW50IChhcyBUZXh0KSB0byBCLUZsb3cuIiwiaW5zdHJ1Y3Rpb25zIjoiU01FTEw6IFRPRE8ifSx7Im5hbWUiOiJiZmxvdy10by1iZmxvd3ZpeiIsImRlc2NyaXB0aW9uIjoiUGFyc2UgZ2l2ZW4gQi1GbG93IHRvIHRoZSBWaXN1YWxpemF0aW9uIEZvcm1hdC4iLCJpbnN0cnVjdGlvbnMiOiJTTUVMTDogVE9ETyJ9LHsibmFtZSI6ImpzLXY4LWNvZGUtZ2VuZXJhdGlvbiIsImRlc2NyaXB0aW9uIjoiXG4gICAgICAgICAgICAgICAgR2VuZXJhdGUgSmF2YXNjcmlwdCAoVjgpIGNvZGUgZm9yIGV4ZWN1dGluZyBUYXNrIGFkIGhvYy5cbiAgICAgICAgICAgICAgICBDYW4gYmUgdXNlZCBhcyBkZWZhdWx0IEFnZW50LlxuICAgICAgICAgICAgIiwiaW5zdHJ1Y3Rpb25zIjoiU01FTEw6IFRPRE8ifSx7Im5hbWUiOiJiZmxvdy1ydW5uZXIiLCJkZXNjcmlwdGlvbiI6IlJ1biB0aGUgZ2l2ZW4gQi1GbG93LiIsImluc3RydWN0aW9ucyI6IlNNRUxMOiBUT0RPIn1d
{% /agents %}
`;

    onMount(async () => {
        await import(
            "@cleverflow/cleverflow.core/webcomponents/markdoc-reader.js"
        );
    });
</script>

<div>markdoc reader</div>
<markdoc-reader {markdoc} />
