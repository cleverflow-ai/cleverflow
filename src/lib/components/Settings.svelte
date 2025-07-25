<script lang="ts">
    let { session } = $props();
</script>

<div class="flex justify-center">
    <div class="p-6 w-[90%] max-w-7xl space-y-4">
        <h2 class="text-lg font-semibold mb-2">Settings</h2>

        <div class="space-y-2">
            <textarea
                bind:value={session.commonSettings}
                class="w-full border px-2 py-1"
                rows="10"
            ></textarea>
        </div>
    </div>
</div>
