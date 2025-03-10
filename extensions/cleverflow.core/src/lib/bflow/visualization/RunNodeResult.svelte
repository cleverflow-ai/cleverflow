<script>
    import {onMount} from 'svelte';
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import { Carta, Markdown } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";
    import { CodeXml, FileText } from "lucide-svelte";
    import prettier from "prettier/standalone";
    import parserBabel from "prettier/parser-babel";

    let { code = "", result = "" } = $props();
    let tab = $state("code");
    const carta = new Carta({
        sanitizer: DOMPurify.sanitize,
    });
    
    let value = $state(result);
    let formattedCode = $state('');

    onMount(async() => {
        // formattedCode = await prettier.format(code ?? '', {
        //     parser: "babel",
        //     plugins: [parserBabel],
        //     semi: true,
        //     singleQuote: true,
        //     tabWidth: 4
        // });
        formattedCode = code;
    });
</script>

<main class="w-full h-screen">
    <div class="m-4">
        <Tabs
            fluid
            listBorder="border-b-surface-500 border-b-[1px]"
            listGap="gap-0"
            value={tab}
            onValueChange={(e) => (tab = e.value)}
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
                <Tabs.Panel value="code" base="my-4 h-full">
                    <div class="w-full h-full">
                        <pre
                            class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                            <code>
                                {formattedCode}
                            </code>
                        </pre>
                    </div>
                </Tabs.Panel>
                <Tabs.Panel value="result" base="my-4 h-full">
                    <div class="w-full h-full">
                        <Markdown {carta} {value} />
                    </div>
                </Tabs.Panel>
            {/snippet}
        </Tabs>
    </div>
</main>
