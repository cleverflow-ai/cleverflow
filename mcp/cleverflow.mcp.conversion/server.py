import base64
from fastmcp import FastMCP
import typer
from typing_extensions import Annotated, Any
from io import BytesIO
from docling.datamodel.base_models import DocumentStream
from docling.chunking import HybridChunker
from converters.DoclingConverter import converter

# Create a Typer application
app = typer.Typer()

# Create an MCP server
mcp = FastMCP(
    "CLEVER°FLOW | Conversion MCP", 
    #maximum_message_size=100 * 1024 * 1024
)

@mcp.tool()
def convert_doc_files_into_text_chunks(
    payloads: list[Annotated[bytes, {"media_type": "application/octet-stream"}]],
    chunk_size: Annotated[int, {"default": 512, "description": "Size of each chunk in bytes"}] = 512
) -> list[dict[str, Any]]:
    """
    Convert Document Files (PDF, Images, DOCX, PPTX, HTML) into Markdown Text + Contextual Text Chunks

    This tool accepts binary file payloads (documents) and outputs structured data containing:
    - the full document converted to markdown, and
    - extracted, contextually enriched text chunks of uniform byte size.

    Input Parameters:
    -----------------
    payloads (list[bytes]):
        A list of Base64-decoded binary files. Each item must be one of the following:
            - PDF
            - Image (e.g., PNG, JPG)
            - DOCX (Microsoft Word)
            - PPTX (PowerPoint)
            - HTML

    chunk_size (int, optional):
        Target size in **bytes** for each individual text chunk. Default is 512 bytes.
        This is used to tune the granularity of chunked output.

    Output Schema:
    --------------
    Returns a list of dictionaries. Each dictionary contains metadata and extracted results for one file.

    Example:
    ```json
    [
        {
            "file_size_bytes": 24583,
            "header_hex": "255044462d312e34",
            "text": "# Title\\nThis is the full document content as markdown...",
            "text_chunks": [
                "This is chunk 1 content...",
                "Chunk 2 with context...",
                ...
            ],
            "duration": 0.326  // Time taken for full processing in seconds
        }
    ]
    ```

    Notes:
    ------
    - The function internally determines document type using file headers and MIME heuristics.
    - Markdown conversion preserves structure (headings, lists, bold/italic, etc.).
    - Chunks are enriched via the `HybridChunker.contextualize()` function.
    - Suitable for NLP pipelines where long documents must be split before vectorization, search indexing, or LLM consumption.
    """
    results = []

    chunker = HybridChunker(max_tokens=chunk_size)

    for payload_index, payload in enumerate(payloads):
        decoded = base64.b64decode(payload)
        file_size = len(decoded)

        # First few bytes as hex for identification
        header_bytes = decoded[:10].hex()

        # TODO: if it's an image, we might use PIL to process it
        buf = BytesIO(decoded)
        source = DocumentStream(name="doc_{index}".format(index=payload_index), stream=buf)
        
        result = converter.convert(source)
        doc = result.document

        markdown = doc.export_to_markdown()

        chunk_iter = chunker.chunk(dl_doc=doc)
        chunks = []

        for chunk_index, chunk in enumerate(chunk_iter):
            # print(f"=== {chunk_index} ===")
            # print(f"chunk.text:\n{f'{chunk.text[:chunk_size]}…'!r}")

            enriched_text = chunker.contextualize(chunk=chunk)
            # print(f"chunker.contextualize(chunk):\n{f'{enriched_text[:chunk_size]}…'!r}")

            chunks.append(enriched_text)        

        results.append(
            {
                "file_size_bytes": file_size,
                "header_hex": header_bytes,
                "text": markdown,
                "text_chunks": chunks,
                "duration": result.timings["pipeline_total"].times
            }
        )

    return results

# @mcp.resource("greeting://{name}")
# def get_greeting(name: str) -> str:
#     """Get a personalized greeting"""
#     return f"Hello, {name}!"

@app.command()
def serve(
    transport: Annotated[str, typer.Option(help="Transport protocol to use (http, sse, or stdio)")] = "http",
    host: Annotated[str, typer.Option(help="Host address for the MCP server")] = "0.0.0.0",
    port: Annotated[int, typer.Option(help="Port for the MCP server")] = 8031,
    path: Annotated[str, typer.Option(help="Path for the MCP server")] = "/mcp"
) -> None:
    mcp.run(transport=transport, host=host, port=port, path=path)

if __name__ == "__main__":
    app()