<script>
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { Shrink, Expand, X } from "lucide-svelte";

    let { modalContent, position = "left" } = $props();

    let drawerState = $state(false);
    let isFullscreen = $state(false);

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
    }

    export const show = () => {
        drawerState = true;
    };
    export const hide = () => {
        drawerState = false;
    };
</script>

{#snippet close()}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={hide}>
        <X class="text-surface-400 w-7 h-7" />
    </div>
{/snippet}
{#snippet toogleFullscreen()}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={toggleFullscreen}>
        {#if isFullscreen}
            <Shrink class="text-surface-400 w-5 h-5" />
        {:else}
            <Expand class="text-surface-400 w-5 h-5" />
        {/if}
    </div>
{/snippet}
{#snippet template()}
    <div class="flex flex-col justify-between items-start h-full">
        <div class="flex justify-end items-center w-full gap-1">
            {@render toogleFullscreen()}
            {@render close()}
        </div>
        {@render modalContent()}
    </div>
{/snippet}

{#if position === "top"}
    <Modal
        open={drawerState}
        onOpenChange={(e) => (drawerState = e.open)}
        triggerBase="btn preset-tonal"
        contentBase="fixed top-0 left-0 bg-surface-100-900 p-4 space-y-4 shadow-xl {isFullscreen
            ? 'w-full h-full'
            : 'w-full h-[480px] max-h-[480px]'}"
        positionerJustify="justify-start"
        positionerAlign=""
        positionerPadding=""
        transitionsPositionerIn={{ y: -480, duration: 200 }}
        transitionsPositionerOut={{ y: -480, duration: 200 }}
    >
        {#snippet content()}
            {@render template()}
        {/snippet}
    </Modal>
{:else if position === "right"}
    <Modal
        open={drawerState}
        onOpenChange={(e) => (drawerState = e.open)}
        triggerBase="btn preset-tonal"
        contentBase="fixed top-0 right-0 bg-surface-100-900 p-4 space-y-4 shadow-xl {isFullscreen
            ? 'w-full h-full'
            : 'w-[480px] max-w-[480px] h-screen'} transition-all duration-300 ease-in-out"
        positionerJustify="justify-end"
        positionerAlign=""
        positionerPadding=""
        transitionsPositionerIn={{ x: 480, duration: 200 }}
        transitionsPositionerOut={{ x: 480, duration: 200 }}
    >
        {#snippet content()}
            {@render template()}
        {/snippet}
    </Modal>
{:else if position === "bottom"}
    <Modal
        open={drawerState}
        onOpenChange={(e) => (drawerState = e.open)}
        triggerBase="btn preset-tonal"
        contentBase="fixed bottom-0 left-0 bg-surface-100-900 p-4 space-y-4 shadow-xl {isFullscreen
            ? 'w-full h-full'
            : 'w-full h-[480px] max-h-[480px]'}"
        positionerJustify="justify-end"
        positionerAlign=""
        positionerPadding=""
        transitionsPositionerIn={{ y: 480, duration: 200 }}
        transitionsPositionerOut={{ y: 480, duration: 200 }}
    >
        {#snippet content()}
            {@render template()}
        {/snippet}
    </Modal>
{:else}
    <Modal
        open={drawerState}
        onOpenChange={(e) => (drawerState = e.open)}
        triggerBase="btn preset-tonal"
        contentBase="fixed top-0 left-0 bg-surface-100-900 p-4 space-y-4 shadow-xl {isFullscreen
            ? 'w-full h-full'
            : 'w-[480px] max-w-[480px] h-screen'}"
        positionerJustify="justify-start"
        positionerAlign=""
        positionerPadding=""
        transitionsPositionerIn={{ x: -480, duration: 200 }}
        transitionsPositionerOut={{ x: -480, duration: 200 }}
    >
        {#snippet content()}
            {@render template()}
        {/snippet}
    </Modal>
{/if}
