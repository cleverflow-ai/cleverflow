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
    "Conversion MCP", 
    # maximum_message_size=100 * 1024 * 1024
)

@mcp.tool()
def convert_pdf_files_into_text_chunks(
    pdf_payloads: list[Annotated[bytes, {"media_type": "application/octet-stream"}]],
    chunk_size: Annotated[int, {"default": 512, "description": "Size of each chunk in bytes"}] = 512
) -> list[dict[str, Any]]:
    """Convert PDF files / streams into Text Chunks.

    Args:
        pdf_payloads: PDF document as binary data from the attachment

    Returns:
        A dictionary with processed results
    """
    results = []

    chunker = HybridChunker(max_tokens=chunk_size)

    for file_index, pdf_payload in enumerate(pdf_payloads):
        decoded = base64.b64decode(pdf_payload)
        
        # Example processing - you can replace this with your actual processing logic
        file_size = len(decoded)

        # First few bytes as hex for identification
        header_bytes = decoded[:10].hex()

        # For example, if it's an image, you might use PIL to process it
        buf = BytesIO(decoded)
        source = DocumentStream(name="doc_{index}.pdf".format(index=file_index), stream=buf)
        
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
def main(
    transport: Annotated[str, typer.Option(help="Transport protocol to use (http, sse, or stdio)")] = "http",
    host: Annotated[str, typer.Option(help="Host address for the MCP server")] = "0.0.0.0",
    port: Annotated[int, typer.Option(help="Port for the MCP server")] = 8000,
    path: Annotated[str, typer.Option(help="Path for the MCP server")] = "/mcp"
) -> None:
    mcp.run(transport=transport, host=host, port=port, path=path)

if __name__ == "__main__":
    main()