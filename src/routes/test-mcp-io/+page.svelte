<script lang="ts">
    import { onMount } from 'svelte';
    import { createClient } from '@cleverflow-ai/cleverflow.mcp.io/dist/client.js';
    import { base } from '$app/paths';
    
    onMount(async () => {
        // const jsonForm = `{
        //     "type": "object",
        //     "properties": {
        //         "name": {
        //             "type": "string",
        //             "title": "Name"
        //         },
        //         "email": {
        //             "type": "string",
        //             "title": "Email"
        //         },
        //         "message": {
        //             "type": "string",
        //             "title": "Message"
        //         }
        //     },
        //     "required": ["name", "email", "message"]
        // }` //await guiAgent.runTask(`generate-json-form`, `Please help me generate a .. with three text fields for ...`);
    }); 
    
    async function fetchOutlineTextFile() : Promise<void> {
        const client = await createClient('http://localhost:3000/mcp');

        // List resources
        const resources = await client.listResources();
        console.log('Resources:', resources);

        // List tools
        const tools = await client.listTools();
        console.log('Tools:', tools);

        const result = await client.callTool({
            name: "fetch-outline-text-file",
            arguments: {
                uri: "outline://textFile",
                fileId: "sealing-technologies-rrOT5m2iSz",
                baseUrl: "https://docs-atlascopco.clevernow.com/",
                apiKey: "ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO"
            }
        });
        console.log('Result:', result);

        // Read a resource
        // const resource = await client.readResource({
        //     uri: "outline://textFile",
        //     fileId: "sealing-technologies-rrOT5m2iSz",
        //     baseUrl: "https://docs-atlascopco.clevernow.com/",
        //     apiKey: "ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO"
        // });
        // console.log('Resource:', resource);
        // console.log('Text:', resource.contents[0].text);    
    }
</script>