import base64
import asyncio
from fastmcp import Client
import json

client = Client("http://0.0.0.0:8031/mcp")
print("Connecting to MCP server ...")

async def ping():
    async with client:
        print("Listing ...")

        # Basic server interaction
        await client.ping()
        
        # List available operations
        tools = await client.list_tools()
        print("Available tools:", tools)

        resources = await client.list_resources()
        print("Available resources:", resources)

        prompts = await client.list_prompts()
        print("Available prompts:", prompts)

async def get_text_chunks(file_path: str):
    async with client:
        print(f"Processing file: {file_path} ...")

        with open(file_path, "rb") as f:
            raw_bytes = f.read()
        encoded = base64.b64encode(raw_bytes).decode("ascii")

        results = await client.call_tool("convert_doc_files_into_text_chunks", {
            "chunk_size": 64,
            "payloads": [
                encoded
            ]
        })

        # print(dir(results[0]))

        # If results is a list of Pydantic models
        serializable = [r.model_dump() for r in results]

        with open("{file_path}.txt".format(file_path=file_path), "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=2, ensure_ascii=False)
        
        print(f"Results saved to {file_path}.txt")

async def test():
    await asyncio.gather(
        ping(),
        get_text_chunks(file_path="./tests/data/planet_history.pdf"),
        get_text_chunks(file_path="./tests/data/planet_history.docx"),
        get_text_chunks(file_path="./tests/data/planet_history.pptx"),
    )

asyncio.run(test())