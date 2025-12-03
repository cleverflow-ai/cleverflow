# ----------------------------------------------------------------------
# SemanticDoclingConverter - full source (with JSON returned as a dict)
# ----------------------------------------------------------------------
# Standard library
# ----------------------------------------------------------------------
import sys
import os
import base64
import time
import json
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Callable
from io import BytesIO
import requests
from collections import defaultdict
from urllib.parse import urljoin
import hashlib
import uuid
from enum import Enum

# ----------------------------------------------------------------------
# Third-party
# ----------------------------------------------------------------------
from PIL import Image
from baml_py import ClientRegistry, Image as BamlImage
from baml_client.sync_client import b as baml
import pandas as pd                 # pip install pandas
import tiktoken                     # pip install tiktoken
import cbor2                        # pip install cbor2
import msgpack                      # pip install msgpack
# protobuf is optional - only imported when the user asks for it
try:
    from google.protobuf import struct_pb2, json_format  # pip install protobuf
    _HAS_PROTOBUF = True
except Exception:          # pragma: no cover
    _HAS_PROTOBUF = False

# ----------------------------------------------------------------------
# Docling
# ----------------------------------------------------------------------
from docling.datamodel.base_models import DocumentStream
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, PictureDescriptionApiOptions, TableFormerMode, VlmPipelineOptions, OcrOptions
from docling.datamodel.pipeline_options_vlm_model import ApiVlmOptions, ResponseFormat
from docling_core.types.doc.document import PictureItem, NodeItem, TableItem, TextItem, RefItem, PictureDescriptionData, SectionHeaderItem
from docling.datamodel.settings import PageRange, DEFAULT_PAGE_RANGE
from docling.chunking import HybridChunker, HierarchicalChunker
from docling.pipeline.vlm_pipeline import VlmPipeline
from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend

# ----------------------------------------------------------------------
# Converter for SVG
# ----------------------------------------------------------------------
from .RasterToVectorConverter import RasterToVectorConverterSettings, RasterToVectorConverter

# ----------------------------------------------------------------------
# Mode enumeration
# ----------------------------------------------------------------------
class Mode(Enum):
    PARSING = "parsing"
    VISIONING = "visioning"
    HYBRID = "hybrid"

def _maybe_int(value: str | None, fallback: Any = None) -> Any:
    """
    Convert *value* to ``int`` if it is a non-empty string.
    Returns ``fallback`` (usually ``None``) for ``None`` or empty strings.
    """
    if value is None:
        return fallback
    stripped = value.strip()
    return int(stripped) if stripped else fallback

# ----------------------------------------------------------------------
# Config POCO
# ----------------------------------------------------------------------
@dataclass
class ConverterConfig:
    # -------------------- General --------------------
    mode: Mode = field(
        default_factory=lambda: Mode(os.getenv("MODE", "parsing"))
    )
    use_gpu: bool = field(
        default_factory=lambda: os.getenv("USE_GPU", "False").lower() == "true"
    )
    num_threads: int = field(
        default_factory=lambda: _maybe_int(os.getenv("NUM_THREADS"), 8)
    )
    max_chunk_sizes: List[int] = field(
        default_factory=lambda: list(
            map(int,
                os.getenv("MAX_CHUNK_SIZES", "256,512,1024").split(",")))
    )
    # overlap between successive token-chunks
    chunk_overlap: int = field(
        default_factory=lambda: _maybe_int(os.getenv("CHUNK_OVERLAP"), 50)
    )

    # -------------------- Tokeniser --------------------
    tokenizer_name: str = field(
        default_factory=lambda: os.getenv("TOKENIZER_NAME", "cl100k_base")
    )

    # -------------------- VLM endpoint --------------------
    vlm_api_url: str = field(
        default_factory=lambda: os.getenv(
            "VLM_API_URL",
            "",
        )
    )
    vlm_api_key: str = field(default_factory=lambda: os.getenv("VLM_API_KEY", ""))
    vlm_model: str = field(
        default_factory=lambda: os.getenv(
            "VLM_MODEL", ""
        )
    )
    vlm_max_tokens: int = field(
        default_factory=lambda: _maybe_int(os.getenv("VLM_MAX_TOKENS"), 4096)
    )
    vlm_temperature: float = field(
        default_factory=lambda: float(os.getenv("VLM_TEMPERATURE", 0.1))
    )
    vlm_timeout: int = field(
        default_factory=lambda: _maybe_int(os.getenv("VLM_TIMEOUT"), 120)
    )
    vlm_prompt: str = field(
        default_factory=lambda: os.getenv(
            "VLM_PROMPT",
            'Extract all text from this image exactly as it appears, preserving the original layout and sequence. Ensure all extracted characters are Latin alphabet letters, numbers, and common punctuation. Transcribe any non-Latin characters to closest Latin equivalents where possible, and make the text readable. Provide the plain text, markdown formatted text, and a summary of up to 5 sentences. Return in JSON format with keys "plain_text", "markdown", and "summary".',
        )
    )

# ----------------------------------------------------------------------
# Input POCO
# ----------------------------------------------------------------------
@dataclass
class ConverterInput:
    """
    payload                - Base-64 encoded document (required)  
    url                    - optional reference URL (used only for naming)  
    iri                    - optional base IRI for generated identifiers  
    conversion_output_format - one of ``json``, ``cbor``, ``msgpack`` or ``protobuf``.
                               Default = ``json``.
    from_page              - optional 1-based inclusive start page (int)  
    to_page                - optional 1-based inclusive end page   (int)
    """
    payload: str                     # required
    url: Optional[str] = None
    iri: Optional[str] = None
    conversion_output_format: str = field(
        default_factory=lambda: os.getenv("CONVERSION_OUTPUT_FORMAT", "json").lower()
    )
    from_page: Optional[int] = None
    to_page: Optional[int] = None

    def get_doc_stream(self) -> DocumentStream:
        """Decode the payload and wrap it in a Docling ``DocumentStream``."""
        decoded = base64.b64decode(self.payload)
        buf = BytesIO(decoded)
        epoch = int(time.time())

        if self.url:
            file_name, file_ext = os.path.splitext(os.path.basename(self.url))
            name = f"{file_name}_{epoch}{file_ext}"
        else:
            name = f"doc_{epoch}"

        sha1_hash = hashlib.sha1(name.encode("utf-8")).hexdigest()

        if self.iri is None or len(self.iri.strip()) == 0:
            base_iri = os.getenv("IRI", "https://cleverflow.ai/ontology/Data")
            self.iri = f"{base_iri}/{sha1_hash}/"

        return DocumentStream(name=name, stream=buf)

    def generate_iri(self, term: str, id_: str) -> str:
        """Helper to create an IRI based on the user-supplied base IRI."""
        if not self.iri:
            return None
        return urljoin(self.iri, f"{term}/{id_}")


# ----------------------------------------------------------------------
# Main converter class
# ----------------------------------------------------------------------
class SemanticDoclingConverter:
    """
    The class can accept an optional *progress_reporter* - any callable that
    takes ``(step_name: str, fraction_done: float)``.  If omitted, progress
    is silently ignored.
    """

    # ------------------------------------------------------------------
    # Construction
    # ------------------------------------------------------------------
    def __init__(self,
                 config: ConverterConfig,
                 progress: Optional[Callable[[float, Optional[float], Optional[str]], None]] = None,
                 log: Optional[Callable[[str], None]] = None):
        self.cfg = config
        self.progress = progress or (lambda progress, total, message: None)
        self.log = log or (lambda message: None)
        self._setup_docling_converter()
        self.encoder = tiktoken.get_encoding(self.cfg.tokenizer_name)

        # Initialize HybridChunker instances for each max token size
        self.chunkers = {
            str(max_chunk_size): HybridChunker(max_tokens=max_chunk_size, overlap=self.cfg.chunk_overlap, with_prov=True)
            # str(max_chunk_size): HierarchicalChunker(max_tokens=max_chunk_size, overlap=self.cfg.chunk_overlap, with_prov=True)
            for max_chunk_size in self.cfg.max_chunk_sizes
        }

        # Initialize BAML client registry for hybrid mode
        if self.cfg.mode == Mode.HYBRID:
            self.cr = ClientRegistry()
            self.cr.add_llm_client(
                "VlmClient",
                "openai-generic",
                {
                    "base_url": self.cfg.vlm_api_url,
                    "api_key": self.cfg.vlm_api_key,
                    "model": self.cfg.vlm_model,
                    "temperature": self.cfg.vlm_temperature
                },
            )
            self.cr.set_primary("VlmClient")
        else:
            self.cr = None

    def _create_openai_compatible_vlm_options(self) -> ApiVlmOptions:
        """Create ApiVlmOptions using the configured VLM settings."""
        headers = {}
        if self.cfg.vlm_api_key:
            headers["Authorization"] = f"Bearer {self.cfg.vlm_api_key}"

        full_url = self.cfg.vlm_api_url.rstrip('/') + '/chat/completions'

        return ApiVlmOptions(
            url=full_url,
            params=dict(
                model=self.cfg.vlm_model,
                max_tokens=self.cfg.vlm_max_tokens,
                temperature=self.cfg.vlm_temperature,
            ),
            headers={**headers, "Content-Type": "application/json"},
            prompt=self.cfg.vlm_prompt,
            timeout=self.cfg.vlm_timeout,
            scale=2.0,
            response_format=ResponseFormat.DOCTAGS
        )

    # ------------------------------------------------------------------
    # Docling initialisation
    # ------------------------------------------------------------------
    def _setup_docling_converter(self) -> None:
        accelerator_options = AcceleratorOptions(
            num_threads=self.cfg.num_threads,
            device=AcceleratorDevice.CUDA if self.cfg.use_gpu else AcceleratorDevice.CPU,
        )

        print(f"Setting up Docling converter in {self.cfg.mode} mode...")

        if self.cfg.mode == Mode.VISIONING:
            print("Using VLM pipeline for visioning mode...")
            vlm_options = self._create_openai_compatible_vlm_options()
            pipeline_options = VlmPipelineOptions(
                enable_remote_services=True,
                vlm_options=vlm_options,
            )
            format_options = {
                InputFormat.PDF: PdfFormatOption(
                    pipeline_options=pipeline_options,
                    pipeline_cls=VlmPipeline,
                    backend=PyPdfiumDocumentBackend, # See also: https://github.com/docling-project/docling/issues/2536
                )
            }
        else:  # parsing or hybrid - use standard pipeline with image generation for VLM processing
            print("Using standard Docling pipeline for parsing/hybrid mode...")
            pipeline_options = PdfPipelineOptions()
            # See also: https://docling-project.github.io/docling/usage/advanced_options/#control-pdf-table-extraction-options
            pipeline_options.do_table_structure = True
            pipeline_options.table_structure_options.do_cell_matching = False
            pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE  # use more accurate TableFormer model

            pipeline_options.accelerator_options = accelerator_options

            # Force OCR for reading Text-based Images
            pipeline_options.do_ocr = True

            # Screenshots of each page - essential for VLM processing in hybrid mode
            pipeline_options.generate_page_images = True
            pipeline_options.images_scale = 2

            # Perform formula, code enrichment and classification of pictures (if applicable)
            # The picture classification step classifies the PictureItem elements in the document with the DocumentFigureClassifier model.
            # This model is specialized to understand the classes of pictures found in documents, e.g. different chart types, flow diagrams, logos, signatures, etc.
            pipeline_options.do_formula_enrichment = True
            pipeline_options.do_code_enrichment = True
            pipeline_options.generate_picture_images = True
            pipeline_options.do_picture_classification = True  # Marks images as contentful
            pipeline_options.do_picture_description = False    # Optional: disable alt-text generation

            format_options = {
                InputFormat.PDF: PdfFormatOption(
                    pipeline_options=pipeline_options,
                    backend=PyPdfiumDocumentBackend, # See also: https://github.com/docling-project/docling/issues/2536
                )
            }

        self.converter = DocumentConverter(
            allowed_formats=[
                InputFormat.DOCX,
                InputFormat.PPTX,
                InputFormat.HTML,
                InputFormat.IMAGE,
                InputFormat.PDF,
                InputFormat.ASCIIDOC,
                InputFormat.MD,
                InputFormat.CSV,
                InputFormat.XLSX,
                InputFormat.XML_USPTO,
                InputFormat.XML_JATS,
                InputFormat.JSON_DOCLING,
                InputFormat.AUDIO,
            ],
            format_options=format_options,
        )

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------
    def convert(self, input_data: ConverterInput) -> Any:
        """
        Executes the whole pipeline and returns the payload already encoded
        in the format requested by ``input_data.conversion_output_format``.
        """
        # --------------------------------------------------------------
        # Convert the raw bytes into Docling's internal model
        # --------------------------------------------------------------
        conversation_result = self.converter.convert(
            input_data.get_doc_stream(), 
            page_range=(
                input_data.from_page if input_data.from_page is not None else 1, 
                input_data.to_page if input_data.to_page is not None else sys.maxsize
            )
        )

        doc = conversation_result.document

        

        self.progress(1, 6, "Raw document converted; text and markdown extracted")

        # --------------------------------------------------------------
        # Extract Pages' Data (text + image)
        # --------------------------------------------------------------
        pages_data = self._extract_pages(doc, input_data)
        self.progress(2, 6, "Pages' data (text + images) extracted")

        # --------------------------------------------------------------
        # Extract semantic entities
        # --------------------------------------------------------------
        # headings = self._extract_headings(doc, input_data)
        figures = self._extract_figures(doc, input_data)
        tables = self._extract_tables(doc, input_data)
        self.progress(3, 6, "Figures and tables extracted")

        # --------------------------------------------------------------
        # Chunk the plain-text (token-based, multi-scale)
        # --------------------------------------------------------------
        chunks = self._chunk_document(doc, input_data)
        self.progress(4, 6, "Document chunked into token-based segments")

        # --------------------------------------------------------------
        # Link each chunk to the entities that share its page
        # --------------------------------------------------------------
        # self._link_entities(chunks, figures, tables)

        # --------------------------------------------------------------
        # Assemble final payload (only non-empty sections are kept)
        # --------------------------------------------------------------
        result: Dict[str, Any] = {}
        
        result["text"] = doc.export_to_text()
        result["markdown"] = doc.export_to_markdown()
        
        if pages_data:
            result["pages"] = pages_data
        # if headings:
        #     result["headings"] = headings
        if chunks:
            result["chunks"] = chunks
        if figures:
            result["figures"] = figures
        if tables:
            result["tables"] = tables
        
        self.progress(5, 6, "Payload assembled with non-empty sections")

        # --------------------------------------------------------------
        # Serialize to the requested format
        # --------------------------------------------------------------
        serialized = self._serialize_output(result,
                                            input_data.conversion_output_format)
        
        self.progress(6, 6, "Output serialized in requested format")

        return serialized

    # ------------------------------------------------------------------
    # Extract Pages (text + image) and Headings
    # ------------------------------------------------------------------
    def _extract_pages(self, doc, input_data: ConverterInput) -> List[Dict[str, Any]]:
        pages_data: List[Dict[str, Any]] = []

        for page_no, page in doc.pages.items():
            page_id = f"page_{page_no}"

            page_texts = []
            provenance_list = []

            for element in doc.texts:
                element_page_numbers = self._extract_page_numbers(element)

                if page_no in element_page_numbers:
                    ref = getattr(element, "self_ref", None)
                    text = getattr(element, "text", None)
                    
                    # Add to page texts
                    if text and len(text.strip()) > 0:
                        page_texts.append(text)

                    # Add to provenance
                    provenance_list.append({
                        "ref": ref,
                        "pageNumbers": [page_no],
                    })

            page_data = {
                "id": page_id,
                "iri": input_data.generate_iri("Page", page_id),
                "text": "\n".join(page_texts).strip(),
                "image": None,
                "metadata": {
                    "ref": getattr(page, "self_ref", None), # PageItem has no self_ref!
                    "pageNumbers": [page_no],
                    "provenance": provenance_list
                }
            }

            if getattr(page, "image", None) is not None:
                page_image_buffer = BytesIO()
                page.image.pil_image.save(page_image_buffer, format="PNG")
                page_image_base64 = base64.b64encode(page_image_buffer.getvalue()).decode("utf-8")
                page_data["image"] = page_image_base64

            pages_data.append(page_data)

        return pages_data

    def _calls_vlm_for_hybrid_via_baml(self, image_base64: str) -> Dict[str, Any]:
        """Call VLM via BAML to extract text and summary from image."""
        try:
            img = BamlImage.from_base64("image/png", image_base64)
            result = baml.Scan(img, baml_options={
                "client_registry": self.cr
            })

            return {"plain_text": result.plain_text, "markdown": result.markdown, "summary": result.summary}
        except Exception as e:
            print(f"Error calling VLM via BAML: {e}")
            return {"plain_text": "", "markdown": "", "summary": ""}

    # ------------------------------------------------------------------
    # Figure extraction
    # ------------------------------------------------------------------
    def _extract_figures(self, doc, input_data: ConverterInput) -> List[Dict[str, Any]]:
        figures: List[Dict[str, Any]] = []

        print(f"Total number of pictures in document: {len(doc.pictures)}")

        figure_counter = 0

        # Traverse all items in the document
        for element, _level in doc.iterate_items():
            if isinstance(element, PictureItem):
                image = element.get_image(doc)
                if image is None:
                    continue

                id = f"figure_{figure_counter}"

                # Encode image as Base64
                buffer = BytesIO()
                image.save(buffer, format="PNG")
                image_bytes = buffer.getvalue()
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")

                # For hybrid mode, call VLM and inject extracted text into doc
                extracted = {"plain_text": "", "markdown": "", "summary": ""}

                if self.cfg.mode == Mode.HYBRID:
                    extracted = self._calls_vlm_for_hybrid_via_baml(image_base64)
                    
                    # Choose markdown if available, otherwise plain_text
                    text_for_doc = extracted.get("markdown") or extracted.get("plain_text")

                    if text_for_doc:
                        # 1️⃣ Create the new TextItem
                        new_index = len(doc.texts)
                        new_text_item = TextItem(
                            self_ref=f"#/texts/{new_index}",
                            text=text_for_doc,
                            label="text",
                            orig=text_for_doc,
                            prov=element.prov,
                            parent=None  # temporarily None
                        )
                        doc.texts.append(new_text_item)

                        # 2️⃣ Determine parent container
                        parent_node = element.parent.resolve(doc) if getattr(element, "parent", None) else doc.body

                        # 3️⃣ Create RefItem for the new TextItem
                        new_ref = RefItem(cref=new_text_item.self_ref)
                        new_text_item.parent = (
                            RefItem(cref=parent_node.self_ref)
                            if hasattr(parent_node, "self_ref")
                            else None
                        )

                        # 4️⃣ Insert RefItem immediately after the image
                        idx = -1
                        for i, child_ref in enumerate(getattr(parent_node, "children", [])):
                            if getattr(child_ref, "cref", None) == element.self_ref:
                                idx = i
                                break

                        if idx >= 0:
                            parent_node.children.insert(idx + 1, new_ref)
                        else:
                            parent_node.children.append(new_ref)

                # Convert PNG to SVG using VTracer
                temp_guid = str(uuid.uuid4())
                temp_png_path = f"{temp_guid}.png"
                temp_svg_path = f"{temp_guid}.svg"

                # Save the PNG to disk
                with open(temp_png_path, "wb") as f:
                    f.write(image_bytes)

                # Call the VTracer converter
                settings = RasterToVectorConverterSettings(colormode="binary")
                converter = RasterToVectorConverter(settings=settings)
                converter.convert(temp_png_path, temp_svg_path)

                # Load SVG string
                with open(temp_svg_path, "r", encoding="utf-8") as f:
                    svg = f.read()

                # Optionally, clean up temporary PNG file
                os.remove(temp_png_path)
                os.remove(temp_svg_path)

                # Extract page numbers robustly
                page_numbers = self._extract_page_numbers(element)

                # Annotations
                annotations = []
                for annotation in element.get_annotations():
                    if isinstance(annotation, PictureDescriptionData):
                        annotations.append(annotation.text)

                # Attempt to retrieve the caption
                caption = getattr(element, 'caption_text', lambda doc: None)(doc)

                # Append to result
                figures.append({
                    "id": id,
                    "iri": input_data.generate_iri("Figure", id),
                    "image": image_base64,
                    "svg": svg,
                    "caption": caption,
                    "annotation": "\n".join(annotations),
                    "plain_text": extracted["plain_text"],
                    "markdown": extracted["markdown"],
                    "summary": extracted["summary"],
                    "metadata": {
                        "ref": getattr(element, "self_ref", None),
                        "pageNumbers": page_numbers,
                    }
                })

                figure_counter += 1

        return figures

    # def _extract_headings(self, doc, input_data: ConverterInput) -> List[Dict[str, Any]]:
    #     def traverse(node):
    #         result = []
    #         for ref in getattr(node, "children", []):
    #             item = ref.resolve(doc)  # resolve to actual DocItem

    #             if isinstance(item, TextItem):
    #                 pages = self._extract_page_numbers(item)

    #                 parentRef = getattr(item, "parent", None)
    #                 parent = parentRef.resolve(doc) if parentRef and isinstance(parentRef, RefItem) else None

    #                 childRefs = getattr(item, "children", [])
    #                 children = [cr.resolve(doc) for cr in childRefs if isinstance(cr, RefItem)]

    #                 heading = {
    #                     "ref": item.self_ref,
    #                     "parent_ref": parent.self_ref if parent else None,
    #                     "child_refs": [c.self_ref for c in children if hasattr(c, "self_ref")],
    #                     "text": item.text.strip(),
    #                     "pageNumbers": pages,
    #                     "children": traverse(item),  # recursively traverse children
    #                 }

    #                 result.append(heading)
    #             elif hasattr(item, "children"):
    #                 # Non-heading container → traverse children
    #                 result.extend(traverse(item))
    #         return result

    #     heading_tree = traverse(doc.body)

    #     # Assign IDs and IRIs
    #     def assign_ids(node):
    #         node["id"] = f"heading_{node['ref']}"
    #         node["iri"] = input_data.generate_iri("Heading", node["id"])
    #         for child in node.get("children", []):
    #             assign_ids(child)

    #     for t in heading_tree:
    #         assign_ids(t)

    #     return heading_tree

    # ------------------------------------------------------------------
    # Table extraction (CSV + plain-text)
    # ------------------------------------------------------------------
    def _extract_tables(self,
                        doc,
                        input_data: ConverterInput) -> List[Dict[str, Any]]:
        tables: List[Dict[str, Any]] = []

        table_counter = 0

        # Iterate over all items in the document
        for element, _level in doc.iterate_items():
            # Check if the element is a table
            if isinstance(element, TableItem):
                tbl_id = f"table_{table_counter}"

                # Export table as CSV via Pandas
                table_df: pd.DataFrame = element.export_to_dataframe()
                csv = table_df.to_csv(index=False, header=True, encoding="utf-8")

                # Save the table as Markdown text
                text = element.export_to_markdown(doc)

                # Extract page numbers robustly (single object or list)
                page_numbers = self._extract_page_numbers(element)

                # Annotations
                annotations = []
                for annotation in element.get_annotations():  # No need to pass 'doc' here
                    if isinstance(annotation, PictureDescriptionData):
                        annotations.append(annotation.text)
                
                # Attempt to retrieve the caption
                caption = getattr(element, 'caption_text', lambda doc: None)(doc)

                tables.append({
                    "id": tbl_id,
                    "iri": input_data.generate_iri("Table", tbl_id),
                    "text": text,
                    "caption": caption,
                    "csv": csv,
                    "metadata": {
                        "ref": getattr(element, "self_ref", None),
                        "pageNumbers": page_numbers,
                    }
                })

                table_counter += 1

        return tables

    # ------------------------------------------------------------------
    # Token-based chunking (multi-scale)
    # ------------------------------------------------------------------
    def _chunk_document(self, doc, input_data: ConverterInput) -> List[Dict[str, Any]]:
        """Create token-based chunks for each page according to the size list, including headings and provenance metadata."""
        results: List[Dict[str, Any]] = []

        for max_tokens in self.cfg.max_chunk_sizes:
            chunker = self.chunkers[str(max_tokens)]
            chunker_type = type(chunker).__name__
            chunks = chunker.chunk(dl_doc=doc)
            index = 0

            for chunk in chunks:
                index += 1
                chunk_id = f"chunk_{chunker_type}_{max_tokens}_{index}"
                enriched_text = chunker.contextualize(chunk=chunk)

                # Extract page numbers from provenance metadata
                page_nums = sorted({
                    prov.page_no
                    for item in chunk.meta.doc_items
                    if hasattr(item, "prov") and item.prov
                    for prov in ([item.prov] if not isinstance(item.prov, list) else item.prov)
                    if getattr(prov, "page_no", None) is not None
                })

                # Extract headings (if available)
                headings = getattr(chunk.meta, "headings", [])

                # Extract all available provenance metadata
                prov_list = []
                for item in chunk.meta.doc_items:
                    if hasattr(item, "prov") and item.prov:
                        ref = getattr(item, "self_ref", None)
                        for prov in ([item.prov] if not isinstance(item.prov, list) else item.prov):
                            prov_entry = {}
                            if hasattr(prov, "page_no"):
                                prov_entry["pageNumbers"] = [prov.page_no]
                            # if hasattr(prov, "bbox"):
                            #     prov_entry["bbox"] = {
                            #         "l": prov.bbox.l if hasattr(prov.bbox, "l") else None,
                            #         "t": prov.bbox.t if hasattr(prov.bbox, "t") else None,
                            #         "r": prov.bbox.r if hasattr(prov.bbox, "r") else None,
                            #         "b": prov.bbox.b if hasattr(prov.bbox, "b") else None,
                            #         "coord_origin": getattr(prov.bbox, "coord_origin", None),
                            #     }
                            # if hasattr(prov, "charspan"):
                            #     prov_entry["charspan"] = prov.charspan
                            if ref is not None:
                                prov_entry["ref"] = ref
                            if prov_entry:
                                prov_list.append(prov_entry)

                results.append({
                    "id": chunk_id,
                    "iri": input_data.generate_iri("Chunk", chunk_id),
                    "text": enriched_text,
                    "metadata": {
                        "ref": getattr(chunk, "self_ref", None),
                        "pageNumbers": page_nums,
                        "chunker": chunker_type,
                        "maxTokens": max_tokens,
                        "headings": headings,
                        "provenance": prov_list,
                    }
                })

        return results

    # ------------------------------------------------------------------
    # Linking - associate chunks with entities
    # ------------------------------------------------------------------
    # def _link_entities(self,
    #                    chunks: List[Dict[str, Any]],
    #                    figures: List[Dict[str, Any]],
    #                    tables: List[Dict[str, Any]]) -> None:
    #     """
    #     Mutates ``chunks`` in-place, adding ID-lists: ``linked_figures``, ``linked_tables``.
    #     Current strategy links by page number (and a placeholder TOC-path matcher).
    #     """
    #     figs_by_page = defaultdict(list)
    #     for f in figures:
    #         for page in f["pageNumbers"]:
    #             figs_by_page[page].append(f)

    #     tbls_by_page = defaultdict(list)
    #     for t in tables:
    #         for page in t["pageNumbers"]:
    #             tbls_by_page[page].append(t)

    #     def toc_match(a: str, b: str) -> bool:
    #         if not a or not b:
    #             return False
    #         return a == b or a.startswith(b) or b.startswith(a)

    #     for chunk in chunks:
    #         linked_f, linked_t = set(), set()

    #         for page_number in chunk["pageNumbers"]:
    #             for f in figs_by_page.get(page_number, []):
    #                 linked_f.add(f["id"])
    #             for t in tbls_by_page.get(page_number, []):
    #                 linked_t.add(t["id"])

    #             # TOC-path fallback (currently unused but kept for completeness)
    #             for f in figures:
    #                 if toc_match(chunk.get("toc_path", ""), f.get("toc_path", "")):
    #                     linked_f.add(f["id"])
    #             for t in tables:
    #                 if toc_match(chunk.get("toc_path", ""), t.get("toc_path", "")):
    #                     linked_t.add(t["id"])

    #         chunk["linked_figures"] = sorted(list(linked_f))
    #         chunk["linked_tables"] = sorted(list(linked_t))

    # ------------------------------------------------------------------
    # VLM helpers (image captioning & specific-section summarisation)
    # ------------------------------------------------------------------
    # def _summarise_image_vlm(self, image_bytes: bytes) -> Dict[str, Any]:
    #     """Ask the configured VLM to describe an image."""
    #     encoded_image = f"data:;base64,{base64.b64encode(image_bytes).decode('utf-8')}"
    #     payload = {
    #         "max_tokens": self.cfg.vlm_max_tokens,
    #         "messages": [
    #             {
    #                 "role": "user",
    #                 "content": [
    #                     {"type": "text", "text": "Describe this image."},
    #                     {"type": "image_url",
    #                      "image_url": {"url": encoded_image}}
    #                 ]
    #             }
    #         ],
    #         "model": self.cfg.vlm_model,
    #         "temperature": self.cfg.vlm_temperature,
    #     }
    #     headers = {
    #         "Content-Type": "application/json",
    #         "Authorization": f"Bearer {self.cfg.vlm_api_key}",
    #     }

    #     resp = requests.post(
    #         self.cfg.vlm_api_url,
    #         headers=headers,
    #         json=payload,
    #         timeout=self.cfg.vlm_timeout,
    #     )
    #     if resp.status_code != 200:
    #         print(f"VLM image request failed ({resp.status_code}); returning empty.")
    #         return {"descriptions": []}
    #     data = resp.json()
    #     descriptions = [
    #         c.get("message", {}).get("content")
    #         for c in data.get("choices", [])
    #         if c.get("message")
    #     ]
    #     return {"raw": data, "descriptions": descriptions}

    # ------------------------------------------------------------------
    # Serialization according to the requested format
    # ------------------------------------------------------------------
    def _serialize_output(self,
                          payload: Dict[str, Any],
                          fmt: str) -> Any:
        """
        ``fmt`` must be one of: ``json``, ``cbor``, ``msgpack`` or ``protobuf``.
        * ``json`` → return the original Python dict (no stringification).  
        * ``cbor`` → Base64-encoded string (cbor2)  
        * ``msgpack`` → Base64-encoded string (msgpack)  
        * ``protobuf`` → Base64-encoded string (google.protobuf.Struct)
        """
        fmt = fmt.lower()
        if fmt == "json":
            return payload                          # ← return dict directly

        if fmt == "cbor":
            return base64.b64encode(cbor2.dumps(payload)).decode("utf-8")

        if fmt == "msgpack":
            return base64.b64encode(msgpack.dumps(payload, use_bin_type=True)).decode("utf-8")

        if fmt == "protobuf":
            if not _HAS_PROTOBUF:
                raise RuntimeError(
                    "protobuf support not installed (pip install protobuf)."
                )
            struct = struct_pb2.Struct()
            struct.update(payload)               # type: ignore[arg-type]
            return base64.b64encode(struct.SerializeToString()).decode("utf-8")

        raise ValueError(f"Unsupported conversion_output_format: {fmt}")
    
    def _extract_page_numbers(self, element) -> List[int]:
        page_numbers = sorted({
            prov.page_no
            for prov in (
                [element.prov] if hasattr(element, "prov") and element.prov and not isinstance(element.prov, list)
                else (element.prov or [])
            )
            if getattr(prov, "page_no", None) is not None
        })
        
        return page_numbers
