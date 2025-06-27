<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { X } from "lucide-svelte";

    let data: any = null;

    let { modalContent } = $props();

    let openState = $state(false);

    export const setData = (value: any) => {
        data = value;
    };
    export const getData = () => {
        return data;
    };

    export const show = () => {
        openState = true;
    };
    export const hide = () => {
        openState = false;
    };
</script>

{#snippet close()}
    <div class="absolute top-0 right-0">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={hide}>
            <X class="text-surface-400 w-7 h-7" />
        </div>
    </div>
{/snippet}
<Modal
    open={openState}
    onOpenChange={(e) => (openState = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <div class="relative">
            {@render close()}
            {@render modalContent()}
        </div>
    {/snippet}
</Modal>
