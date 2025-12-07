# ----------------------------------------------------------------------
# Direct test for SemanticDoclingConverter with different modes
# ----------------------------------------------------------------------
import base64
import json
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Add parent directory to path for imports to work when run as standalone script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ----------------------------------------------------------------------
# Import the converter classes
# ----------------------------------------------------------------------
from converters.SemanticDoclingConverter import (
    SemanticDoclingConverter,
    ConverterConfig,
    ConverterInput,
    Mode
)


# ----------------------------------------------------------------------
# Progress callback for testing
# ----------------------------------------------------------------------
def progress_callback(progress: float, total: float | None, message: str | None):
    if total is not None:
        percentage = (progress / total) * 100
        print(f"Progress: {percentage:.1f}% - {message or ''}")
    else:
        print(f"Progress: {progress} - {message or ''}")


# ----------------------------------------------------------------------
# Shared test function – call SemanticDoclingConverter.convert directly
# ----------------------------------------------------------------------
def test_conversion(file_path: str, mode: Mode):
    """
    Reads *file_path*, creates converter with given mode configuration,
    calls converter.convert() directly and stores the result on disk.
    """
    print(f"Starting {mode.name.lower()} mode conversion test...")

    # Create configuration with given mode
    config = ConverterConfig(
        mode=mode
    )

    print(f"Configuration created: mode={config.mode}")

    # Load and encode the PDF file
    path_obj = Path(file_path)
    payload_bytes = path_obj.read_bytes()
    payload_b64 = base64.b64encode(payload_bytes).decode("ascii")

    # Create converter input
    input_data = ConverterInput(
        payload=payload_b64,
        url=f"file://{path_obj.resolve()}",
        conversion_output_format="json"
    )

    print("Input data prepared, creating converter...")

    # Create the converter
    converter = SemanticDoclingConverter(
        config=config,
        progress=progress_callback
    )

    print("Converter created, starting conversion...")

    # Call convert method directly
    result = converter.convert(input_data)

    print("Conversion completed, saving result...")

    # Save the result to a new file
    out_path = path_obj.with_suffix(path_obj.suffix + f".{mode.name.lower()}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False, default=str)

    print(f"✅  JSON result written to {out_path}")
    print(f"Result type: {type(result)}")
    if isinstance(result, dict):
        print(f"Result keys: {list(result.keys())}")


# ----------------------------------------------------------------------
# Specific test functions for different modes
# ----------------------------------------------------------------------
def test_parsing_conversion():
    """
    Test conversion with parsing mode.
    """
    test_conversion("./tests/data/dgx_spark_mixed_content_1p.pdf", Mode.PARSING)


def test_visioning_conversion():
    """
    Test conversion with visioning mode.
    """
    test_conversion("./tests/data/dgx_spark_mixed_content_1p.pdf", Mode.VISIONING)


def test_hybrid_conversion():
    """
    Test conversion with hybrid mode.
    """
    test_conversion("./tests/data/dgx_spark_mixed_content_1p.pdf", Mode.HYBRID)


# ----------------------------------------------------------------------
# Run the tests
# ----------------------------------------------------------------------
if __name__ == "__main__":
    # test_parsing_conversion()
    # test_visioning_conversion()
    test_hybrid_conversion()
