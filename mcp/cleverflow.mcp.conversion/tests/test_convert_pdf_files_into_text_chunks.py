import base64
import asyncio
from fastmcp import Client
import json

# HTTP server
client = Client("http://localhost:8031/mcp")

async def main():
    async with client:
        # Basic server interaction
        await client.ping()
        
        # List available operations
        tools = await client.list_tools()
        print("Available tools:", tools)

        resources = await client.list_resources()
        print("Available resources:", resources)

        prompts = await client.list_prompts()
        print("Available prompts:", prompts)

        # Execute test on the target tool
        pdf_path = "./tests/data/miele_washing_machine.en.pdf"

        with open(pdf_path, "rb") as f:
            raw_bytes = f.read()
        encoded = base64.b64encode(raw_bytes).decode("ascii")

        results = await client.call_tool("convert_pdf_files_into_text_chunks", {
            "chunk_size": 512,
            "pdf_payloads": [
                encoded
            ]
        })

        print(dir(results[0]))

        # If results is a list of Pydantic models
        serializable = [r.model_dump() for r in results]

        with open("./tests/results.txt", "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=2, ensure_ascii=False)

asyncio.run(main())