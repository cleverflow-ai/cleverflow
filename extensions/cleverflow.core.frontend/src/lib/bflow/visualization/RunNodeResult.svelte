<script lang="ts">
    import { onMount } from "svelte";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import { Carta, Markdown } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";
    import { CodeXml, FileText } from "lucide-svelte";
    import CodeBlock from "../../common/components/codeblock/CodeBlock.svelte";
    import * as JsonUtil from "../../common/utils/JsonUtil.js";

    let { code, result } = $props();
    let tab = $state("code");
    const carta = new Carta({
        sanitizer: DOMPurify.sanitize,
    });

    let value: any = $state(null);
    if (result) {
        if (typeof result == "string") {
            value = result;
        } else {
            value = "```json \n" + JSON.stringify(result, null, 4) + "\n```";
        }
    }
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
        {#if code}
            <Tabs.Control
                value="code"
                stateActive="border-b-primary-500 border-b-[3px]"
            >
                <div class="flex justify-center items-center gap-2">
                    <CodeXml class="w-6 h-6" />
                    <span>Code</span>
                </div>
            </Tabs.Control>
        {/if}
        {#if value}
            <Tabs.Control
                value="result"
                stateActive="border-b-primary-500 border-b-[3px]"
            >
                <div class="flex justify-center items-center gap-2">
                    <FileText class="w-6 h-6" />
                    <span>Result</span>
                </div>
            </Tabs.Control>
        {/if}
    {/snippet}
    {#snippet content()}
        {#if code}
            <Tabs.Panel
                value="code"
                base="my-4 w-full h-full max-h-[calc(100%-100px)] overflow-auto"
            >
                <div class="w-full h-full space-y-4">
                    <CodeBlock code={JsonUtil.showLineBreak(code)}></CodeBlock>
                </div>
            </Tabs.Panel>
        {/if}
        {#if value}
            <Tabs.Panel value="result" base="my-4 h-full">
                <div
                    class="w-full h-full max-h-[calc(100%-100px)] overflow-auto"
                >
                    <Markdown {carta} value={JsonUtil.showLineBreak(value)} />
                </div>
            </Tabs.Panel>
        {/if}
    {/snippet}
</Tabs>
