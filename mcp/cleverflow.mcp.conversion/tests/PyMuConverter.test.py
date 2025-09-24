from ..converters.PyMuConverter import PyMuConverter

converter = PyMuConverter()
image_files = converter.convert(
    pdf_file_path="./tests/data/planet_history.pdf",
    page_range=39,
    output_format_svg={"enabled": True},
    output_format_png={"enabled": True, "dpi": 300},
)
print("🎉 Exported files:", image_files)