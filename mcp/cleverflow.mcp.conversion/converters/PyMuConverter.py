import os
import pymupdf  # PyMuPDF
from typing import List, Optional, Dict, Union

class PyMuConverter:
    """
    Converter class to handle PDF to SVG/PNG conversion using PyMuPDF.
    """
    def convert(
        pdf_file_path: str,
        page_range: Optional[Union[range, int]] = None,
        output_folder_path: Optional[str] = None,
        output_format_svg: Optional[Dict] = None,
        output_format_png: Optional[Dict] = None,
    ) -> List[str]:
        """
        Export PDF pages to SVG and/or PNG images.

        Args:
            pdf_file_path (str): Path to the input PDF file.
            page_range (range or int, optional): Range of pages to export (1-based) or a single page number. Default = all pages.
            output_folder_path (str, optional): Where to save outputs. Defaults to "<pdf_folder>/output".
            output_format_svg (dict, optional): SVG export options. Example: {"enabled": True}.
            output_format_png (dict, optional): PNG export options. Example: {"enabled": True, "dpi": 300}.

        Returns:
            List[str]: List of paths to the exported files.
        """
        # Default settings
        if output_format_svg is None:
            output_format_svg = {"enabled": True}
        if output_format_png is None:
            output_format_png = {"enabled": True, "dpi": 300}

        # Default output folder
        if output_folder_path is None:
            pdf_dir = os.path.dirname(pdf_file_path)
            output_folder_path = os.path.join(pdf_dir, "output")
        os.makedirs(output_folder_path, exist_ok=True)

        # Open PDF
        doc = pymupdf.open(pdf_file_path)
        total_pages = len(doc)

        # Normalize page_range
        if page_range is None:
            pages = list(range(1, total_pages + 1))  # all pages
        elif isinstance(page_range, int):
            if 1 <= page_range <= total_pages:
                pages = [page_range]
            else:
                raise ValueError(f"Page number {page_range} is out of range (1-{total_pages}).")
        elif isinstance(page_range, range):
            # Ensure pages are valid and 1-based
            pages = [p for p in page_range if 1 <= p <= total_pages]
            if not pages:
                raise ValueError(f"Page range {page_range} does not contain any valid pages (1-{total_pages}).")
        else:
            raise TypeError("page_range must be None, an int, or a range object.")

        exported_files = []

        for page_number in pages:
            page = doc[page_number - 1]  # PyMuPDF uses 0-based index

            # --- Export as SVG ---
            if output_format_svg.get("enabled", False):
                svg_str = page.get_svg_image(text_as_path=False)
                svg_path = os.path.join(output_folder_path, f"page_{page_number}.svg")
                with open(svg_path, "w", encoding="utf-8") as f:
                    f.write(svg_str)
                exported_files.append(svg_path)

            # --- Export as PNG ---
            if output_format_png.get("enabled", False):
                dpi = output_format_png.get("dpi", 300)
                pix = page.get_pixmap(dpi=dpi)
                png_path = os.path.join(output_folder_path, f"page_{page_number}.png")
                pix.save(png_path)
                exported_files.append(png_path)

        return exported_files