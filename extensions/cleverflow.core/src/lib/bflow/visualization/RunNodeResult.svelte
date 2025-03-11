<script lang="ts">
    import { onMount } from "svelte";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import { Carta, Markdown } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";
    import { CodeXml, FileText } from "lucide-svelte";
    import CodeBlock from "../../common/components/codeblock/CodeBlock.svelte";

    let { code = "", result = "" } = $props();
    let tab = $state("code");
    const carta = new Carta({
        sanitizer: DOMPurify.sanitize,
    });

    let value = $state(result);
</script>

<Tabs
    fluid
    base="h-full w-full"
    contentBase="h-full w-full"
    listBorder="border-b-surface-500 border-b-[1px]"
    listGap="gap-0"
    value={tab}
    onValueChange={(e: any) => (tab = e.value)}
>
    {#snippet list()}
        <Tabs.Control
            value="code"
            stateActive="border-b-primary-500 border-b-[3px]"
        >
            <div class="flex justify-center items-center gap-2">
                <CodeXml class="w-6 h-6" />
                <span>Code</span>
            </div>
        </Tabs.Control>
        <Tabs.Control
            value="result"
            stateActive="border-b-primary-500 border-b-[3px]"
        >
            <div class="flex justify-center items-center gap-2">
                <FileText class="w-6 h-6" />
                <span>Result</span>
            </div>
        </Tabs.Control>
    {/snippet}
    {#snippet content()}
        <Tabs.Panel
            value="code"
            base="my-4 w-full h-full max-h-[calc(100%-100px)] overflow-auto"
        >
            <div class="w-full h-full space-y-4">
                <CodeBlock {code}></CodeBlock>
            </div>
        </Tabs.Panel>
        <Tabs.Panel value="result" base="my-4 h-full">
            <div class="w-full h-full max-h-[calc(100%-100px)] overflow-auto">
                <Markdown {carta} {value} />
            </div>
        </Tabs.Panel>
    {/snippet}
</Tabs>
