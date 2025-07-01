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
pipeline_options.table_structure_options.do_cell_matching = True

converter = DocumentConverter(
        allowed_formats=[
                    InputFormat.PDF,
                    InputFormat.IMAGE,
                    InputFormat.DOCX,
                    InputFormat.HTML,
                    InputFormat.PPTX,
        ],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
            )
        }
    )

print("Docling Converter started")
print("Using accelerator:", accelerator_options.device)