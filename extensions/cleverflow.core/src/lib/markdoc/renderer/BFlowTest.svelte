<script lang="ts">
    let { bflow, id }: any = $props();
</script>

{#if bflow}
    bflow
    <pre class="bg-gray-100 p-4 rounded-lg">
        <code>{bflow}</code>
    </pre>
{:else}
    <div class="text-red-500">BFlow with ID "{id}" not found.</div>
{/if}
