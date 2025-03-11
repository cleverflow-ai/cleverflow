<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
  import { onMount } from "svelte";
  import MarkdocRendererController from "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer-controller.js";

  const eventServer = "ws://localhost:8080";
  const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

  const currentTheme = "crimson";
  let tab = $state("editor");

  let markdocRendererController = $state(null);

  // svelte-ignore non_reactive_update
  let markdocEditorElement: any;

  let markdoc = $state(`
  {% b-flow id="select-baking-machines" %}
    {% sequence %}                    
        {% get-text %}
Get List of all Machines from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
        {% /get-text %}

        {% filter-data %}
            Filter the List of Machines for having Availability as 'available'.
        {% /filter-data %}

        {% get-text %}
            Get Machine Selection Processes from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
        {% /get-text %}

        {% select-machine %}
Select the best suitable Machines for Customer, based on the filtered Machines and the Selection Process: for baking Brownies and Muffins.
        {% /select-machine %}
    {% /sequence %}	
	
	{% agents %}
		[{"name":"markdoc-custom-element-to-bflow","description":"Parse given Markdoc Custome Element (as Text) to B-Flow.","instructions":"SMELL: TODO"},{"name":"bflow-to-bflowviz","description":"Parse given B-Flow to the Visualization Format.","instructions":"SMELL: TODO"},{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            ","instructions":"SMELL: TODO"},{"name":"bflow-runner","description":"Run the given B-Flow.","instructions":"SMELL: TODO"}]
	{% /agents %}	
	
	{% bflow %}
		{"id":null,"name":null,"description":null,"root":{"type":"SEQUENCE","id":"select-baking-machines_sequence_1","name":null,"description":null,"config":null,"state":"SUCCESS","goto":[{"type":"ACTION","id":"get-text_select-baking-machines_get-text_1","name":"get-text","description":"Get List of all Machines from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md","config":null,"state":"SUCCESS","goto":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "},"inputs":[],"output":{}},{"type":"ACTION","id":"filter-data_select-baking-machines_filter-data_1","name":"filter-data","description":"Filter the List of Machines for having Availability as 'available'.","config":null,"state":"SUCCESS","goto":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "},"inputs":["get-text_select-baking-machines_get-text_1"],"output":{}},{"type":"ACTION","id":"get-text_select-baking-machines_get-text_2","name":"get-text","description":"Get Machine Selection Processes from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md","config":null,"state":"SUCCESS","goto":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "},"inputs":["filter-data_select-baking-machines_filter-data_1"],"output":{}},{"type":"ACTION","id":"select-machine_select-baking-machines_select-machine_1","name":"select-machine","description":"Select the best suitable Machines for Customer, based on the filtered Machines and the Selection Process: for baking Brownies and Muffins.","config":null,"state":"SUCCESS","goto":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "},"inputs":["get-text_select-baking-machines_get-text_2"],"output":{}}],"agent":null,"inputs":null,"output":null}}
	{% /bflow %}	
	
	{% bflowviz %}
		{"nodes":[{"type":"SEQUENCE","id":"select-baking-machines_sequence_1","parentNodeId":null,"name":null,"description":null,"config":null,"agent":null},{"type":"ACTION","id":"get-text_select-baking-machines_get-text_1","parentNodeId":"select-baking-machines_sequence_1","name":"get-text","description":"Get List of all Machines from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md","config":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "}},{"type":"ACTION","id":"filter-data_select-baking-machines_filter-data_1","parentNodeId":"select-baking-machines_sequence_1","name":"filter-data","description":"Filter the List of Machines for having Availability as 'available'.","config":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "}},{"type":"ACTION","id":"get-text_select-baking-machines_get-text_2","parentNodeId":"select-baking-machines_sequence_1","name":"get-text","description":"Get Machine Selection Processes from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md","config":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "}},{"type":"ACTION","id":"select-machine_select-baking-machines_select-machine_1","parentNodeId":"select-baking-machines_sequence_1","name":"select-machine","description":"Select the best suitable Machines for Customer, based on the filtered Machines and the Selection Process: for baking Brownies and Muffins.","config":null,"agent":{"name":"js-v8-code-generation","description":"\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "}}],"edges":[{"id":"edge_2","source":"select-baking-machines_sequence_1","target":"get-text_select-baking-machines_get-text_1"},{"id":"edge_3","source":"select-baking-machines_sequence_1","target":"filter-data_select-baking-machines_filter-data_1"},{"id":"edge_4","source":"select-baking-machines_sequence_1","target":"get-text_select-baking-machines_get-text_2"},{"id":"edge_5","source":"select-baking-machines_sequence_1","target":"select-machine_select-baking-machines_select-machine_1"}]}
	{% /bflowviz %}	
	
	{% outs %}
    {"get-text_select-baking-machines_get-text_1":{"code":"const machinesList = await load('https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md');\nreturn machinesList;","result":"| Machine Model | Machine Line | Availability | Target Types of Cakes      |\n|---------------|--------------|--------------|----------------------------|\n| Model A1      | Line 1       | Available    | Cupcake, Muffin            |\n| Model B2      | Line 2       | Available    | Cake, Sponge Cake          |\n| Model C3      | Line 3       | Unavailable  | Cheesecake, Brownie        |\n| Model D4      | Line 4       | Available    | Tart, Pie                  |\n| Model E5      | Line 5       | Maintenance  | Cupcake, Cake              |\n| Model F6      | Line 6       | Available    | Sponge Cake, Muffin        |\n| Model G7      | Line 7       | Available    | Cheesecake, Tart           |\n| Model H8      | Line 8       | Unavailable  | Brownie, Pie               |\n| Model I9      | Line 9       | Available    | Cupcake, Cheesecake        |\n| Model J10     | Line 10      | Available    | Muffin, Tart               |\n| Model K11     | Line 11      | Maintenance  | Cake, Brownie              |\n| Model L12     | Line 12      | Available    | Pie, Cheesecake            |\n| Model M13     | Line 13      | Available    | Tart, Sponge Cake          |\n| Model N14     | Line 14      | Unavailable  | Cupcake, Cake              |\n| Model O15     | Line 15      | Available    | Muffin, Brownie            |\n| Model P16     | Line 16      | Available    | Cheesecake, Pie            |\n| Model Q17     | Line 17      | Maintenance  | Tart, Cupcake              |\n| Model R18     | Line 18      | Available    | Sponge Cake, Cake          |\n| Model S19     | Line 19      | Available    | Muffin, Cheesecake         |\n| Model T20     | Line 20      | Unavailable  | Tart, Brownie              |"},"filter-data_select-baking-machines_filter-data_1":{"code":"const machines = [\n  { 'Machine Model': 'Model A1', 'Machine Line': 'Line 1', 'Availability': 'Available', 'Target Types of Cakes': 'Cupcake, Muffin' },\n  { 'Machine Model': 'Model B2', 'Machine Line': 'Line 2', 'Availability': 'Available', 'Target Types of Cakes': 'Cake, Sponge Cake' },\n  { 'Machine Model': 'Model D4', 'Machine Line': 'Line 4', 'Availability': 'Available', 'Target Types of Cakes': 'Tart, Pie' },\n  { 'Machine Model': 'Model F6', 'Machine Line': 'Line 6', 'Availability': 'Available', 'Target Types of Cakes': 'Sponge Cake, Muffin' },\n  { 'Machine Model': 'Model G7', 'Machine Line': 'Line 7', 'Availability': 'Available', 'Target Types of Cakes': 'Cheesecake, Tart' },\n  { 'Machine Model': 'Model I9', 'Machine Line': 'Line 9', 'Availability': 'Available', 'Target Types of Cakes': 'Cupcake, Cheesecake' },\n  { 'Machine Model': 'Model J10', 'Machine Line': 'Line 10', 'Availability': 'Available', 'Target Types of Cakes': 'Muffin, Tart' },\n  { 'Machine Model': 'Model L12', 'Machine Line': 'Line 12', 'Availability': 'Available', 'Target Types of Cakes': 'Pie, Cheesecake' },\n  { 'Machine Model': 'Model M13', 'Machine Line': 'Line 13', 'Availability': 'Available', 'Target Types of Cakes': 'Tart, Sponge Cake' },\n  { 'Machine Model': 'Model O15', 'Machine Line': 'Line 15', 'Availability': 'Available', 'Target Types of Cakes': 'Muffin, Brownie' },\n  { 'Machine Model': 'Model P16', 'Machine Line': 'Line 16', 'Availability': 'Available', 'Target Types of Cakes': 'Cheesecake, Pie' },\n  { 'Machine Model': 'Model R18', 'Machine Line': 'Line 18', 'Availability': 'Available', 'Target Types of Cakes': 'Sponge Cake, Cake' },\n  { 'Machine Model': 'Model S19', 'Machine Line': 'Line 19', 'Availability': 'Available', 'Target Types of Cakes': 'Muffin, Cheesecake' }\n];\n\nconst availableMachines = machines.filter(machine => machine['Availability'] === 'Available');\n\nreturn availableMachines;","result":[{"Machine Model":"Model A1","Machine Line":"Line 1","Availability":"Available","Target Types of Cakes":"Cupcake, Muffin"},{"Machine Model":"Model B2","Machine Line":"Line 2","Availability":"Available","Target Types of Cakes":"Cake, Sponge Cake"},{"Machine Model":"Model D4","Machine Line":"Line 4","Availability":"Available","Target Types of Cakes":"Tart, Pie"},{"Machine Model":"Model F6","Machine Line":"Line 6","Availability":"Available","Target Types of Cakes":"Sponge Cake, Muffin"},{"Machine Model":"Model G7","Machine Line":"Line 7","Availability":"Available","Target Types of Cakes":"Cheesecake, Tart"},{"Machine Model":"Model I9","Machine Line":"Line 9","Availability":"Available","Target Types of Cakes":"Cupcake, Cheesecake"},{"Machine Model":"Model J10","Machine Line":"Line 10","Availability":"Available","Target Types of Cakes":"Muffin, Tart"},{"Machine Model":"Model L12","Machine Line":"Line 12","Availability":"Available","Target Types of Cakes":"Pie, Cheesecake"},{"Machine Model":"Model M13","Machine Line":"Line 13","Availability":"Available","Target Types of Cakes":"Tart, Sponge Cake"},{"Machine Model":"Model O15","Machine Line":"Line 15","Availability":"Available","Target Types of Cakes":"Muffin, Brownie"},{"Machine Model":"Model P16","Machine Line":"Line 16","Availability":"Available","Target Types of Cakes":"Cheesecake, Pie"},{"Machine Model":"Model R18","Machine Line":"Line 18","Availability":"Available","Target Types of Cakes":"Sponge Cake, Cake"},{"Machine Model":"Model S19","Machine Line":"Line 19","Availability":"Available","Target Types of Cakes":"Muffin, Cheesecake"}]},"get-text_select-baking-machines_get-text_2":{"code":"const selectionProcesses = await load('https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md');\nreturn selectionProcesses;","result":"### How to select the correct Machines?\n\n1. **Select Machine Line for Cupcakes**:\n   - Choose lines that can produce Cupcakes and are Available.\n   - Suggested Machine Models: Model A1, Model I9, Model Q17 (if back in service).\n\n2. **Select Machine Line for Muffins**:\n   - Choose lines that can produce Muffins and are Available.\n   - Suggested Machine Models: Model A1, Model F6, Model J10, Model O15, Model S19.\n\n3. **Select Machine Line for Cakes**:\n   - Choose lines that can produce Cakes and are Available.\n   - Suggested Machine Models: Model B2, Model E5 (if back in service), Model K11 (if back in service), Model N14 (if back in service), Model R18.\n\n4. **Select Machine Line for Sponge Cakes**:\n   - Choose lines that can produce Sponge Cakes and are Available.\n   - Suggested Machine Models: Model B2, Model F6, Model M13, Model R18.\n\n5. **Select Machine Line for Cheesecakes**:\n   - Choose lines that can produce Cheesecakes and are Available.\n   - Suggested Machine Models: Model G7, Model I9, Model L12, Model P16, Model S19.\n\n6. **Select Machine Line for Brownies**:\n   - Choose lines that can produce Brownies and are Available.\n   - Suggested Machine Models: Model O15, Model T20 (if back in service).\n\n7. **Select Machine Line for Tarts**:\n   - Choose lines that can produce Tarts and are Available.\n   - Suggested Machine Models: Model D4, Model G7, Model J10, Model M13, Model P16, Model T20 (if back in service).\n\n8. **Select Machine Line for Pies**:\n   - Choose lines that can produce Pies and are Available.\n   - Suggested Machine Models: Model D4, Model L12, Model P16."},"select-machine_select-baking-machines_select-machine_1":{"code":"const availableMachines = await load('available_machines.json');\nconst machines = JSON.parse(availableMachines);\n\nconst selectedMachines = {\n  brownies: [],\n  muffins: []\n};\n\nfor (const machine of machines) {\n  if (machine.available && machine.models.includes('O15')) {\n    selectedMachines.brownies.push(machine.name);\n  }\n  if (machine.available && ['A1', 'F6', 'J10', 'O15', 'S19'].includes(machine.model)) {\n    selectedMachines.muffins.push(machine.name);\n  }\n}\n\nreturn selectedMachines;"},"save_select-baking-machines_save_1":{"code":"const data = await load('https://example.com/data.json');\nreturn data;"}}
  {% /outs %}	
	
{% /b-flow %}
  `);

  onMount(async () => {
    await import("@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js");
    await import(
      "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer.js"
    );

    markdocRendererController = new MarkdocRendererController(
      eventServer,
      eventServerToken,
    );

    markdocRendererController.setMarkdoc(markdoc);
  });

  const switchToEditor = () => {
    tab = "editor";
  };

  const switchToView = () => {
    markdoc = markdocEditorElement.getMarkdown();
    markdocRendererController.setMarkdoc(markdoc);
    tab = "viewer";
  };
</script>

<main class="w-full h-screen">
  <div class="m-4">
    <Tabs
      fluid
      listBorder="border-b-surface-500 border-b-[1px]"
      listGap="gap-0"
      value={tab}
      onValueChange={(e) => {
        // tab = e.value;
        if (e.value === "viewer") {
          switchToView();
        } else {
          switchToEditor();
        }
      }}
    >
      {#snippet list()}
        <Tabs.Control
          value="editor"
          stateActive="border-b-primary-500 border-b-[3px]"
        >
          <div class="flex justify-center items-center gap-2">
            <Pencil class="w-6 h-6" />
            <span>Editor</span>
          </div>
        </Tabs.Control>
        <Tabs.Control
          value="viewer"
          stateActive="border-b-primary-500 border-b-[3px]"
        >
          <div class="flex justify-center items-center gap-2">
            <Eye class="w-6 h-6" />
            <span>View</span>
          </div>
        </Tabs.Control>
      {/snippet}
      {#snippet content()}
        <Tabs.Panel value="editor" base="my-4 h-full">
          <div class="w-full h-full">
            <markdoc-editor
              name="mydoc.mdoc"
              text={markdoc}
              theme={currentTheme}
              bind:this={markdocEditorElement}
            ></markdoc-editor>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="viewer" base="my-4 h-full">
          <div class="w-full h-full">
            {#if markdocRendererController && markdoc}
              <markdoc-renderer
                controller={markdocRendererController}
                theme={currentTheme}
              ></markdoc-renderer>
            {:else}
              <div
                class="h-screen w-full flex flex-col justify-center items-center gap-2"
              >
                <p class="text-surface-500">
                  The provided Markdoc content is invalid.
                </p>
                <button
                  class="mt-4 btn preset-tonal-surface"
                  onclick={switchToEditor}
                >
                  <Pencil class="w-5 h-5" />
                  Back to Editor
                </button>
              </div>
            {/if}
          </div>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
  </div>
  <!-- Sticky button -->
  {#if tab === "editor"}
    <button
      class="fixed bottom-5 left-1/2 -translate-x-1/2 transition btn preset-filled-primary-500"
      onclick={switchToView}
    >
      Render
    </button>
  {/if}
</main>
