<script module>
    export { add };
    const myFunction = () => {
        alert("hehe");
    };
</script>

{#snippet add()}
    <button type="button" class="btn" onclick={() => myFunction()}
        >CLICK ME</button
    >
{/snippet}
