<script>
    export let level = 1;
    const tag = `h${level}`;
    const className = `h${level}`;
</script>

<svelte:element this={tag} class={className}>
    <slot />
</svelte:element>
