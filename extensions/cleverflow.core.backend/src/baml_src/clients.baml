client<llm> Ollama_Default {
  provider "openai-generic"
  options {
    base_url env.BASE_URL
    model "gemma2:latest"
    api_key "ollama"
    tempature 0
  }
}

client<llm> Ollama_Tool {
  provider "openai-generic"
  options {
    base_url env.BASE_URL
    model "deepscaler:latest"
    api_key "ollama"
    tempature 0
  }
}