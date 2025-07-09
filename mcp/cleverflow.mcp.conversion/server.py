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
    payloads: list[Annotated[str, {"media_type": "application/octet-stream", "description": "Base64-encoded document data"}]],
    chunk_size: Annotated[int, {"default": 512, "description": "Size of each chunk in bytes"}] = 512
) -> list[dict[str, Any]]:
    """
    Convert Document Files (PDF, Images, DOCX, PPTX, HTML) into Markdown Text + Contextual Text Chunks

    This tool accepts Base64-encoded strings representing binary document files. It returns:
      - the full document converted into Markdown, and
      - a list of enriched text chunks split by byte size.

    Parameters:
    -----------
    payloads (list[str]):
        A list of Base64-encoded strings.
        Each string must represent one of the following document types:
          - PDF
          - DOCX (Microsoft Word)
          - PPTX (PowerPoint)
          - HTML
          - Image (e.g., PNG, JPEG)

    chunk_size (int, optional):
        Desired chunk size in bytes. Controls how large each text segment will be.
        Default is `512`.

    Returns:
    --------
    list[dict[str, Any]]:
        One entry per input document with the following structure:
        ```json
        {
            "file_size_bytes": 24583,
            "header_hex": "255044462d312e34",
            "text": "# Document Title\\nFull document as markdown...",
            "text_chunks": [
                "This is chunk 1",
                "This is chunk 2",
                ...
            ],
            "duration": 0.326
        }
        ```

    Notes:
    ------
    - This tool is designed to support LLM pipelines, RAG, and semantic chunking workflows.
    - Markdown representation preserves structural formatting (e.g., bold, headers, links).
    - Uses `HybridChunker` for token-aware chunking and contextual enrichment.
    - If image content is passed, it must be a decodable format (JPG, PNG, etc.).
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