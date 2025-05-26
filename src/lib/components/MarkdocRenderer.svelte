<script>
    import Markdoc from "@markdoc/markdoc";
    import { onMount } from "svelte";

    let { doc } = $props();

    let rendered = $state("");

    onMount(() => {
        console.log(doc);
        const ast = Markdoc.parse(doc);
        const content = Markdoc.transform(ast);
        rendered = Markdoc.renderers.html(content);
    });
</script>

<div class="card p-4 bg-base-100 shadow-md">
    {@html rendered}
</div>
