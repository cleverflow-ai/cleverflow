client<llm> VlmClient {
  provider "openai-generic"
  options {
    base_url ""
    model ""
    supports_streaming true
  }
}

class ScanResult {
  plain_text string
  markdown string
  summary string
}

function Scan(image: image) -> ScanResult {
  client VlmClient
  prompt #"
    Extract all text from this image exactly as it appears, preserving the original layout and sequence. Ensure all extracted characters are Latin alphabet letters, numbers, and common punctuation. Transcribe any non-Latin characters to closest Latin equivalents where possible, and make the text readable. Provide the plain text, markdown formatted text, and a summary of up to 5 sentences. Return in JSON format with keys "plain_text", "markdown", and "summary".
    {{ image }}
    --
    {{ ctx.output_format }}
  "#
}
