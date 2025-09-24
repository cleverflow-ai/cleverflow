import vtracer
import os
from dataclasses import dataclass

@dataclass
class RasterToVectorConverterSettings:
    colormode: str = 'color'            # 'color' or 'binary'
    hierarchical: str = 'stacked'       # 'stacked' or 'cutout'
    mode: str = 'spline'                # 'spline', 'polygon', or 'none'
    filter_speckle: int = 4
    color_precision: int = 6
    layer_difference: int = 16
    corner_threshold: int = 60
    length_threshold: float = 4.0
    max_iterations: int = 10
    splice_threshold: int = 45
    path_precision: int = 3

class RasterToVectorConverter:
    def __init__(self, settings: RasterToVectorConverterSettings = RasterToVectorConverterSettings()):
        self.settings = settings
    
    def convert(
        self,
        png_path: str,
        svg_path: str
    ):
        """
        Convert a PNG image to SVG using VTracer with the latest options.

        Args:
            png_path (str): Input PNG image path.
            svg_path (str): Output SVG file path.
            settings (VTracerSettings): Configuration options for VTracer.
        """
        if not os.path.exists(png_path):
            raise FileNotFoundError(f"Input file not found: {png_path}")

        settings = self.settings

        # Use VTracer Python binding to convert image to SVG
        vtracer.convert_image_to_svg_py(
            png_path,
            svg_path,
            colormode=settings.colormode,
            hierarchical=settings.hierarchical,
            mode=settings.mode,
            filter_speckle=settings.filter_speckle,
            color_precision=settings.color_precision,
            layer_difference=settings.layer_difference,
            corner_threshold=settings.corner_threshold,
            length_threshold=settings.length_threshold,
            max_iterations=settings.max_iterations,
            splice_threshold=settings.splice_threshold,
            path_precision=settings.path_precision
        )

        print(f"✅ SVG saved to {svg_path}")