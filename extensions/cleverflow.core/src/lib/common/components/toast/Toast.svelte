<script lang="ts">
    import { toasts, removeToast } from "./toastStore.js";

    const toastTypes = {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-yellow-500",
        info: "bg-blue-500",
        fallback: "bg-gray-950",
    };
</script>

<div class="fixed top-5 right-5 flex flex-col gap-3 z-50">
    {#each $toasts as { id, message, type }}
        {@const style = toastTypes[type ?? toastTypes.fallback]}
        <div
            class="text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500 opacity-100 {style}"
            on:click={() => removeToast(id)}
        >
            {message}
        </div>
    {/each}
</div>
