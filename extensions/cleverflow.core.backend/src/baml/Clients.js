import { ClientRegistry } from '@boundaryml/baml';
/**
 * The `Clients` class is responsible for managing a registry of LLM (Large Language Model) clients.
 * It provides default configurations for different clients and allows setting a primary client.
 */
/**
 * @file Clients.ts
 * @description This file contains the definition of the Clients class, which manages a registry of LLM clients.
 */
/**
 * @class Clients
 * @description The Clients class is responsible for managing a registry of LLM clients. It provides static constants for default client configurations and initializes the registry with these clients.
 */
class Clients {
    /**
     * @constructor
     * @param {Partial<{ primary: string }>} [config={ primary: Clients.OllamaDefault }]
     * @description Initializes a new instance of the Clients class. Sets up the client registry with default clients and sets the primary client.
     */
    constructor(config = { primary: Clients.OllamaDefault }) {
        var _a;
        this._registry = new ClientRegistry();
        this._registry.addLlmClient(Clients.OllamaDefault, 'openai-generic', {
            // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
            base_url: 'http://57.128.86.248:11434/v1',
            api_key: 'ollama',
            model: 'gemma2:latest',
            temperature: 0,
        });
        this._registry.addLlmClient(Clients.OllamaTool, 'openai-generic', {
            // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
            base_url: 'http://57.128.86.248:11434/v1',
            api_key: 'ollama',
            model: 'qwen2.5:latest',
            temperature: 0,
        });
        this._registry.addLlmClient(Clients.OllamaCode, 'openai-generic', {
            // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
            base_url: 'http://57.128.86.248:11434/v1',
            api_key: 'ollama',
            model: 'qwen2.5-coder:latest',
            temperature: 0,
        });
        this._registry.setPrimary((_a = config.primary) !== null && _a !== void 0 ? _a : Clients.OllamaDefault);
    }
    /**
     * @property {ClientRegistry} registry
     * @description Gets the client registry.
     * @returns {ClientRegistry} The client registry.
     */
    get registry() {
        return this._registry;
    }
}
/**
 * @constant {string} OllamaDefault
 * @description The default client configuration identifier.
 */
Clients.OllamaDefault = 'Ollama_Default';
/**
 * @constant {string} OllamaTool
 * @description The tool client configuration identifier.
 */
Clients.OllamaTool = 'Ollama_Tool';
/**
 * @constant {string} OllamaCode
 * @description The code client configuration identifier.
 */
Clients.OllamaCode = 'Ollama_Code';
export default Clients;
