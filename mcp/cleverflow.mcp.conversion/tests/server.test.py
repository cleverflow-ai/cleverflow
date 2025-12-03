# ----------------------------------------------------------------------
# FastMCP client – test harness that streams progress callbacks
# ----------------------------------------------------------------------
import base64
import asyncio
import json
from pathlib import Path
from fastmcp import Client
from fastmcp.client.logging import LogMessage
from fastmcp.client.transports import StreamableHttpTransport

# ----------------------------------------------------------------------
# MCP endpoint (adjust host / port if you run the server elsewhere)
# ----------------------------------------------------------------------
async def log_handler(message: LogMessage):
    print(f"Server log: {message.data}")

async def progress_handler(progress: float, total: float | None, message: str | None):
    if total is not None:
        percentage = (progress / total) * 100
        print(f"Progress: {percentage:.1f}% - {message or ''}")
    else:
        print(f"Progress: {progress} - {message or ''}")

transport = StreamableHttpTransport(
    url="http://0.0.0.0:8031/mcp",
    headers={
        "Authorization": "Bearer 123"
    }
)

client = Client(
    transport=transport,
    log_handler=log_handler,
    progress_handler=progress_handler
)


# ----------------------------------------------------------------------
# Helper – print a short summary of the server
# ----------------------------------------------------------------------
async def ping():
    async with client:
        await client.ping()                     # simple health‑check
        tools = await client.list_tools()
        print("✅  Available tools :", tools)

        resources = await client.list_resources()
        print("✅  Available resources :", resources)

        prompts = await client.list_prompts()
        print("✅  Available prompts :", prompts)


# ----------------------------------------------------------------------
# Core test – send ONE document to the "convert" tool with different modes
# ----------------------------------------------------------------------
async def convert_doc(file_path: str, mode: str):
    """
    Test conversion with the specified mode (parsing, visioning, or hybrid).
    """
    async with client:
        path_obj = Path(file_path)
        payload_bytes = path_obj.read_bytes()
        payload_b64 = base64.b64encode(payload_bytes).decode("ascii")

        request_body = {
            "config": {
                "mode": mode
            },
            "input": {
                "payload": payload_b64,
                "url": f"file://{path_obj.resolve()}",
                "conversion_output_format": "json",
            },
        }

        response = await client.call_tool("convert", request_body, progress_handler=progress_handler)
        result = response.structured_content["data"]

        out_path = path_obj.with_suffix(path_obj.suffix + f".{mode}.json")
        out_path.write_text(
            json.dumps(
                result,
                indent=2,
                ensure_ascii=False,
                default=str,
            ),
            encoding="utf-8",
        )
        print(f"✅  JSON result written to {out_path}")


# ----------------------------------------------------------------------
# Run all checks and tests in parallel
# ----------------------------------------------------------------------
async def test():
    # Run ping and the three conversion tests
    await asyncio.gather(
        ping(),
        convert_doc("./tests/data/dgx_spark_mixed_content_1p.pdf", "parsing"),
        # convert_doc("./tests/data/dgx_spark_mixed_content_1p.pdf", "visioning"),
        convert_doc("./tests/data/dgx_spark_mixed_content_1p.pdf", "hybrid")
    )


if __name__ == "__main__":
    asyncio.run(test())
