# ----------------------------------------------------------------------
# fastmcp_tool.py - FastMCP wrapper that streams progress to the client
# ----------------------------------------------------------------------
from fastmcp import FastMCP, Context
import typer
from typing_extensions import Annotated, Any
from dotenv import load_dotenv
import asyncio

# ----------------------------------------------------------------------
# Import the *new* converter (the file you saved in the previous answer)
# ----------------------------------------------------------------------
from converters.SemanticDoclingConverter import (
    SemanticDoclingConverter,
    ConverterConfig,
    ConverterInput,
)

# ----------------------------------------------------------------------
# Load environment variables (e.g. API keys, defaults, etc.)
# ----------------------------------------------------------------------
load_dotenv()

# ----------------------------------------------------------------------
# Typer CLI (optional - keeps the original CLI behaviour)
# ----------------------------------------------------------------------
app = typer.Typer()

# ----------------------------------------------------------------------
# Initialise the MCP server
# ----------------------------------------------------------------------
mcp = FastMCP("CLEVER°FLOW | Conversion MCP")


# ----------------------------------------------------------------------
# MCP tool definition
# ----------------------------------------------------------------------
@mcp.tool
async def convert(
    config: Annotated[
        ConverterConfig,
        {"description": "Converter configuration (optional - overrides env defaults)"},
    ] = None,
    input: Annotated[
        ConverterInput, 
        {"description": "Input payload"}
    ] = None,
    ctx: Context = None
) -> Any:
    """
    FastMCP-exposed conversion tool for converting documents (allowed formats:
    PDF, DOCX, PPTX, HTML, etc.) into structured representations using the
    ``SemanticDoclingConverter``.  The tool chunks the text and extracts tables
    and figures.  The output can be returned as JSON, CBOR, MessagePack, or
    Protobuf and is streamed to the MCP client.

    **LinkML schema (for tooling / LLMs)**

    ------------------------------------------------------------------
    Input - configuration (partial, all fields optional)
    ------------------------------------------------------------------
    class ConverterMcpConfig:
        \"\"\"Subset of ``ConverterConfig`` that can be supplied by the client.
        Missing fields are filled from environment variables or library defaults.\"\"\"

        use_gpu: boolean = false
        num_threads: integer = 8
        max_chunk_sizes: integer[] = [256, 512, 1024]
        chunk_overlap: integer = 50
        tokenizer_name: string = "cl100k_base"
        vlm_api_url: string = "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions"
        vlm_api_key: string?          # secret - keep out of logs
        vlm_model: string = "Mistral-Small-3.2-24B-Instruct-2506"
        vlm_max_tokens: integer = 512
        vlm_temperature: float = 0.2
        vlm_timeout: integer = 120

    ------------------------------------------------------------------
    Input - document payload
    ------------------------------------------------------------------
    class ConverterMcpInput:
        \"\"\"Payload sent by the MCP client to the tool.\"\"\"

        payload: string                # Base-64-encoded document (required)
        url?: string                  # Optional source URL - used only for naming
        iri?: string                  # Optional base IRI for generated identifiers
        from_page?: integer           # 1-based inclusive start page
        to_page?: integer             # 1-based inclusive end page
        conversion_output_format?: string = "json"
            # Allowed values: "json", "cbor", "msgpack", "protobuf"

    ------------------------------------------------------------------
    Output - what the MCP client receives
    ------------------------------------------------------------------
    class ConverterMcpResult:
        \"\"\"Wrapper returned by the MCP server.  ``data`` is already encoded
        according to the requested format.  For ``json`` it is a JSON object;
        for the other three it is a raw ``bytes`` blob.\"\"\"

        data: any                     # dict for JSON, bytes for binary formats

        # When ``conversion_output_format`` == "json", ``data`` expands to:
        class JsonResult:
            text: string
            markdown: string
            pages: Page[]
            chunks: Chunk[]
            figures: Figure[]
            tables: Table[]

        class Page:
            id: string
            iri: string?
            text: string
            image?: string               # base64-encoded PNG
            metadata:
                ref?: string
                pageNumbers: integer[]
                provenance: ProvReference[]

        class Chunk:
            id: string
            iri: string?
            text: string
            metadata:
                ref?: string
                pageNumbers: integer[]
                chunker: string
                maxTokens: integer
                headings: string[]
                provenance: ProvReference[]

        class Figure:
            id: string
            iri: string?
            image: string                # base64-encoded PNG
            svg?: string                 # vectorized SVG representation of the figure
            caption?: string
            annotation?: string
            metadata:
                ref?: string
                pageNumbers: integer[]

        class Table:
            id: string
            iri: string?
            text: string
            caption?: string
            csv: string
            metadata:
                ref?: string
                pageNumbers: integer[]

        class ProvReference:
            ref?: string
            pageNumbers: integer[]
    """

    # Build the effective configuration
    effective_cfg = ConverterConfig()          # starts from ENV defaults

    if config is not None:                     # user supplied a partial config
        # ``config`` is a dataclass - copy only the fields that are not None
        for fld, val in config.__dict__.items():
            if val is not None:
                setattr(effective_cfg, fld, val)
    
    
    # Build the SemanticDoclingConverter with the reporter
    async def async_progress(progress: float, total: float | None, message: str | None) -> None:
        await ctx.report_progress(progress, total)
        print(f"Streamed: {progress} of {total or ''} - {message or ''}")

    # Wrap the async progress function in a synchronous callable
    def sync_progress(progress: float, total: float | None, message: str | None) -> None:
        # Check if an event loop is already running
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            # Schedule the async function in the current event loop
            asyncio.create_task(async_progress(progress, total, message))
        else:
            # Run the async function in a new event loop
            asyncio.run(async_progress(progress, total, message))

    # Pass the synchronous wrapper to the converter
    converter = SemanticDoclingConverter(
        config=effective_cfg,
        progress=sync_progress
    )

    # Run the conversion - result is already encoded
    result = converter.convert(input)

    # Return an MCP-compliant payload.
    # For JSON the result is a dict; for the other three formats it is
    # raw bytes.  MCP will forward the object unchanged to the client.
    return {"data": result}


@app.command()
def serve(
    transport: Annotated[str, typer.Option(help="Transport protocol (http, sse, stdio)")] = "http",
    host: Annotated[str, typer.Option(help="Host address")] = "0.0.0.0",
    port: Annotated[int, typer.Option(help="Port for MCP server")] = 8031,
    path: Annotated[str, typer.Option(help="Path for MCP server")] = "/mcp"
) -> None:
    mcp.run(transport=transport, host=host, port=port, path=path)


if __name__ == "__main__":
    app()