import base64
from fastmcp import FastMCP
import typer
from typing_extensions import Annotated, Any
from io import BytesIO
from PIL import Image  # Pillow for image encoding
from docling.datamodel.base_models import DocumentStream
from docling.chunking import HybridChunker
from converters.DoclingConverter import converter

# Create a Typer application
app = typer.Typer()

# Create an MCP server
mcp = FastMCP("CLEVER°FLOW | Conversion MCP")


@mcp.tool()
def convert_doc_files_into_text_chunks(
    payloads: list[
        Annotated[str, {"media_type": "application/octet-stream", "description": "Base64-encoded document data"}]
    ],
    chunk_size: Annotated[int, {"default": 512, "description": "Size of each chunk in bytes"}] = 512
) -> dict:
    """
    Convert uploaded document files (PDF, Images, DOCX, PPTX, HTML) into structured JSON with
    complete text, per-page images, and accurate page number tracking via Docling provenance.

    **Features**
    ------------
    - Extracts **full document text** in Markdown format (lossy: no page numbers in this view).
    - Splits content into **contextual text chunks** using HybridChunker.
    - Resolves **exact page numbers** for each chunk from Docling `prov.page_no` metadata.
    - Generates **per-page images** as base64 PNGs for visual reference.
    - Provides **file metadata** (size, magic number hex header).
    - Records **processing duration** from Docling’s pipeline timings.

    **Page Number Handling**
    ------------------------
    Page numbers are **not guessed**—they are retrieved from the provenance of each `DocItem`:
    ```python
    page_nums = sorted({
        prov.page_no
        for item in chunk.meta.doc_items
        for prov in getattr(item, "prov", [])
        if hasattr(prov, "page_no") and prov.page_no is not None
    })
    ```
    This ensures that each chunk’s `pageNumbers` array is accurate and directly corresponds to
    the original document pages.

    **Input**
    ---------
    payloads : list[str]
        Base64-encoded binary document data.
        Accepted formats:
          - PDF
          - DOCX (Microsoft Word)
          - PPTX (Microsoft PowerPoint)
          - HTML
          - Image (PNG, JPEG, etc.)

    chunk_size : int, optional
        Target chunk size in tokens (default = 512).

    **Output**
    ----------
    A JSON object in MCP-compliant format:
    ```json
    {
      "data": [
        {
          "file_size_bytes": 24583,
          "header_hex": "255044462d312e34",
          "text": {
            "text": "# Document Title\\nFull document in markdown...",
            "pageNumbers": [1, 2, 3],
            "pageImages": ["iVBORw0KGgoAAAANSUhEUg...", "..."]
          },
          "text_chunks": [
            {
              "text": "This is chunk 1...",
              "pageNumbers": [1],
              "pageImages": ["iVBORw0KGgoAAAANSUhEUg..."]
            },
            {
              "text": "This is chunk 2...",
              "pageNumbers": [2],
              "pageImages": ["iVBORw0KGgoAAAANSUhEUg..."]
            }
          ],
          "duration": 0.326
        }
      ]
    }
    ```

    **Notes**
    ---------
    - Markdown output is for human-readable purposes only; it does not carry page metadata.
    - Page images are generated at the detected page count from the Docling `doc.pages` property.
    - If a page image cannot be generated, `None` will be placed in that position.
    """
    results = []
    chunker = HybridChunker(max_tokens=chunk_size)

    for payload_index, payload in enumerate(payloads):
        decoded = base64.b64decode(payload)
        file_size = len(decoded)
        header_bytes = decoded[:10].hex()

        buf = BytesIO(decoded)
        source = DocumentStream(name=f"doc_{payload_index}", stream=buf)
        result = converter.convert(source)
        doc = result.document

        # Export markdown text (lossy: no page numbers, but still useful)
        markdown_text = doc.export_to_markdown()

        # Pre-generate all page images
        all_page_images_b64 = []
        for page_num in range(len(doc.pages)):
            try:
                page_img = doc.page_images[page_num]
                if not isinstance(page_img, Image.Image):
                    page_img = Image.open(BytesIO(page_img))
                img_buf = BytesIO()
                page_img.save(img_buf, format="PNG")
                all_page_images_b64.append(
                    base64.b64encode(img_buf.getvalue()).decode("utf-8")
                )
            except Exception as e:
                print(f"Could not get image for page {page_num+1}: {e}")
                all_page_images_b64.append(None)

        # Build chunks with proper page numbers from provenance
        chunks_data = []
        for chunk in chunker.chunk(dl_doc=doc):
            enriched_text = chunker.contextualize(chunk=chunk)

            # Extract page numbers from provenance metadata
            page_nums = sorted({
                prov.page_no
                for item in chunk.meta.doc_items
                for prov in getattr(item, "prov", [])
                if hasattr(prov, "page_no") and prov.page_no is not None
            })

            chunks_data.append({
                "text": enriched_text,
                "pageNumbers": page_nums,
                "pageImages": [
                    all_page_images_b64[p - 1]  # page_no is 1-based
                    for p in page_nums
                    if 1 <= p <= len(all_page_images_b64)
                ]
            })

        results.append(
            {
                "file_size_bytes": file_size,
                "header_hex": header_bytes,
                "text": {
                    "text": markdown_text,
                    "pageNumbers": list(range(1, len(doc.pages) + 1)),
                    "pageImages": all_page_images_b64
                },
                "text_chunks": chunks_data,
                "duration": result.timings["pipeline_total"].times
            }
        )

    # Return MCP-compliant JSON
    return {
        "data": results
    }


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