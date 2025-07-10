client<llm> Ollama_Default {
  provider "openai-generic"
  options {
    base_url env.OLLAMA_OPENAI_URL
    model "gemma3:12b"
    headers {
      "Api-Key" env.OLLAMA_API_KEY
    }
    api_key "ollama"    
    tempature 0.1
  }
}

client<llm> Ollama_Tool {
  provider "openai-generic"
  options {
    base_url env.OLLAMA_OPENAI_URL
    model "qwen3:14b"
    headers {
      "Api-Key" env.OLLAMA_API_KEY
    }
    api_key "ollama"
    tempature 0.1
  }
}

client<llm> Ollama_Code {
  provider "openai-generic"
  options {
    base_url env.OLLAMA_OPENAI_URL
    model "phi4:latest"
    headers {
      "Api-Key" env.OLLAMA_API_KEY
    }
    api_key "ollama"
    tempature 0.1
  }
}
