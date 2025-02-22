<script lang="ts">
    import { Pencil, Eye } from "lucide-svelte";
    import { onMount } from 'svelte';
    import * as m from '$lib/paraglide/messages.js';

    onMount(async () => {
        await import('@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js');
        await import('@cleverflow/cleverflow.core/webcomponents/b-flow.js');
    });
  
    let activeTab = $state("editor");

    // svelte-ignore non_reactive_update
    let markdocEditorElement: any = null;
    let blowElement: any = null;
  
    function switchToView() {
      bflow = markdocEditorElement.getMarkdown();
      activeTab = "view";
    }

    let bflow = $state(
        `
        {% b-flow id="prepare_data" %}
            {% sequence %}
                1. Getting List of all Machine Models and corresponding Infos.
                {% get-text id="action_1" %}
                    url: https://cleverflow.ai/use-cases/machinery/machines-list.md
                {% /get-text %}

                2. Converting Selection Logic to a Behavioral Flow to both 
                enable AI-based Decision Making, 
                and explain the Choices made to Human.
                {% get-bflow id="action_2" %}
                    url: https://cleverflow.ai/use-cases/machinery/machines-selection.md
                {% /get-bflow %}
                
                {% sequence id="test" %}
                    3. Converting Selection Logic to a Behavioral Flow to both 
                    enable AI-based Decision Making, 
                    and explain the Choices made to Human.
                    {% get-bflow id="action_3" %}
                        url: https://cleverflow.ai/use-cases/machinery/machines-selection2.md
                    {% /get-bflow %}

                    4. Converting Selection Logic to a Behavioral Flow to both 
                    enable AI-based Decision Making, 
                    and explain the Choices made to Human.
                    {% get-bflow id="action_4" %}
                        url: https://cleverflow.ai/use-cases/machinery/machines-selection3.md
                    {% /get-bflow %}
                {% /sequence %}
            {% /sequence %}
        {% /b-flow %}
    `
    );


  </script>
  
  <div class="flex flex-col h-screen">
    <!-- Tabs -->
    <div class="flex justify-center bg-gray-50 border-b border-gray-300 shadow-sm p-3 space-x-4">
      <button
        class="flex items-center gap-2 px-4 py-2 text-lg font-medium transition rounded-lg relative"
        onclick={() => (activeTab = 'editor')}
      >
        <Pencil class="w-5 h-5" />
        <span>Editor</span>
        {#if activeTab === 'editor'}
          <span class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-full"></span>
        {/if}
      </button>

      <button
        class="flex items-center gap-2 px-4 py-2 text-lg font-medium transition rounded-lg relative"
        onclick={() => (activeTab = 'view')}
      >
        <Eye class="w-5 h-5" />
        <span>View</span>
        {#if activeTab === 'view'}
          <span class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-full"></span>
        {/if}
      </button>
    </div>
  
    <!-- Content -->
    <div class="flex-1 w-full">
      {#if activeTab === "editor"}
        <div class="w-full h-full">
          <markdoc-editor name="mydoc.mdoc" text={bflow} bind:this={markdocEditorElement}></markdoc-editor>  
        </div>
      {:else}
        <div class="w-full h-full">
          <b-flow url="https://cleverflow.ai/files/dummy.mdoc" text={bflow} bind:this={blowElement}></b-flow>
        </div>
      {/if}
    </div> 
  
    <!-- Sticky button -->
    {#if activeTab === "editor"}
      <button
        class="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition"
        onclick={switchToView}
      >
        <Eye class="w-5 h-5" />
        Show
      </button>
    {/if}
  </div>
  