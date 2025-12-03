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
# Initialise the MCP server
# ----------------------------------------------------------------------
mcp = FastMCP("CLEVER°FLOW | Conversion MCP | V0.2.0", version="0.2.0")

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
    CLEVER°FLOW | Conversion MCP | V0.2.0
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

        mode: Mode = PARSING  # Mode enum: PARSING, VISIONING, or HYBRID
        use_gpu: boolean = false
        num_threads: integer = 8
        max_chunk_sizes: integer[] = [256, 512, 1024]  # Token counts for chunking
        chunk_overlap: integer = 50  # Token overlap between chunks
        tokenizer_name: string = "cl100k_base"  # Tokenizer for tokenization
        vlm_api_url: string  # URL for VLM service (required for visioning/hybrid)
        vlm_api_key: string?  # Secret key for VLM authentication
        vlm_model: string  # VLM model identifier
        vlm_max_tokens: integer = 4096  # Max tokens for VLM response
        vlm_temperature: float = 0.1  # Temperature for VLM generation
        vlm_timeout: integer = 120  # Timeout for VLM requests in seconds
        vlm_prompt: string  # Prompt template for VLM processing

    ------------------------------------------------------------------
    Input - document payload
    ------------------------------------------------------------------
    class ConverterMcpInput:
        \"\"\"Payload sent by the MCP client to the tool.\"\"\"

        payload: string (required)       # Base-64-encoded document bytes
        url?: string                    # Optional source URL for document naming
        iri?: string                    # Optional base IRI for generated identifiers
        conversion_output_format?: string = "json"
            # One of: "json", "cbor", "msgpack", "protobuf"
        from_page?: integer             # 1-based inclusive start page
        to_page?: integer               # 1-based inclusive end page

    ------------------------------------------------------------------
    Output - what the MCP client receives
    ------------------------------------------------------------------
    class ConverterMcpResult:
        \"\"\"Wrapper returned by the MCP server.  ``data`` is already encoded
        according to the requested format.  For ``json`` it is a dict;
        for the other three it is a Base64-encoded bytes string.\"\"\"

        data: any                     # dict for JSON, base64 string for binary formats

        # When ``conversion_output_format`` == "json", ``data`` expands to:
        class JsonResult:
            text: string  # Plain text content of the entire document
            markdown: string  # Markdown formatted content
            pages: Page[]  # Array of page objects (if present)
            chunks: Chunk[]  # Array of token-based chunks (if present)
            figures: Figure[]  # Array of figures/images (if present)
            tables: Table[]  # Array of tables (if present)

        class Page:
            id: string  # Unique page identifier (e.g., "page_1")
            iri?: string  # Optional IRI reference
            text: string  # Extracted text content from the page
            image?: string  # Base64-encoded PNG of the page image (if available)
            metadata: object
                ref?: string  # Reference to document element
                pageNumbers: integer[]  # Array of page numbers
                provenance: ProvReference[]  # Provenance tracking

        class Chunk:
            id: string  # Unique chunk identifier
            iri?: string  # Optional IRI reference
            text: string  # Token-based chunked text with context
            metadata: object
                ref?: string  # Reference to document element
                pageNumbers: integer[]  # Pages this chunk spans
                chunker: string  # Chunker type (e.g., "HybridChunker")
                maxTokens: integer  # Maximum token count for this chunk
                headings: string[]  # Associated headings
                provenance: ProvReference[]  # Detailed provenance

        class Figure:
            id: string  # Unique figure identifier
            iri?: string  # Optional IRI reference
            image: string  # Base64-encoded PNG of the figure
            svg?: string  # Vectorized SVG representation (if available)
            caption?: string  # Figure caption text
            annotation?: string  # Additional annotations
            plain_text?: string  # VLM-extracted plain text (hybrid mode only)
            markdown?: string  # VLM-extracted markdown (hybrid mode only)
            summary?: string  # VLM-generated summary (hybrid mode only)
            metadata: object
                ref?: string  # Reference to document element
                pageNumbers: integer[]  # Pages where figure appears

        class Table:
            id: string  # Unique table identifier
            iri?: string  # Optional IRI reference
            text: string  # Markdown-formatted table representation
            caption?: string  # Table caption text
            csv: string  # CSV format of table data
            metadata: object
                ref?: string  # Reference to document element
                pageNumbers: integer[]  # Pages where table appears

        class ProvReference:
            ref?: string  # Document element reference
            pageNumbers: integer[]  # Relevant page numbers
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
        await ctx.info(f"Streamed: {progress} of {total or ''} - {message or ''}")

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

# Create ASGI application
app = mcp.http_app(transport="http", path="/mcp")
