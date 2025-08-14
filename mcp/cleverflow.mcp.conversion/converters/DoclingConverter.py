import os
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.settings import settings
from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
)

# Enable the profiling to measure the time spent
settings.debug.profile_pipeline_timings = True

has_cuda = os.path.exists("/dev/nvidia0")

# Set the accelerator options
accelerator_options = AcceleratorOptions(
    num_threads=8, 
    device=AcceleratorDevice.CUDA if has_cuda else AcceleratorDevice.CPU
)
pipeline_options = PdfPipelineOptions()
pipeline_options.accelerator_options = accelerator_options

pipeline_options.do_ocr = True
pipeline_options.do_table_structure = True
pipeline_options.generate_page_images = True

pipeline_options.table_structure_options.do_cell_matching = True

# See also: https://github.com/docling-project/docling/blob/5d98bcea1bd03aff426f903211c931620ff8fcc1/docling/datamodel/base_models.py#L45
converter = DocumentConverter(
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
            InputFormat.AUDIO
        ],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
            )
        }
    )

print("Docling Converter started")
print("Using accelerator:", accelerator_options.device)