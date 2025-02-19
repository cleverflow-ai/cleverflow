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
export default class Clients {
    private _registry: ClientRegistry;

    /**
     * @constant {string} OllamaDefault
     * @description The default client configuration identifier.
     */
    public static readonly OllamaDefault = 'Ollama_Default';

    /**
     * @constant {string} OllamaTool
     * @description The tool client configuration identifier.
     */
    public static readonly OllamaTool = 'Ollama_Tool';

    /**
     * @constructor
     * @param {Partial<{ primary: string }>} [config={ primary: Clients.OllamaDefault }]
     * @description Initializes a new instance of the Clients class. Sets up the client registry with default clients and sets the primary client.
     */
    constructor(config: Partial<{ primary: string }> = { primary: Clients.OllamaDefault }) {
        this._registry = new ClientRegistry();

        this._registry.addLlmClient(
            Clients.OllamaDefault, 
            'openai-generic', 
            {
                // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
                base_url: 'http://57.128.86.248:11434/v1',
                api_key: 'ollama',
                model:'gemma2:latest' ,
                temperature: 0,
            }
        );

        this._registry.addLlmClient(
            Clients.OllamaTool, 
            'openai-generic', 
            {
                // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
                base_url: 'http://57.128.86.248:11434/v1',
                api_key: 'ollama',
                model:'command-r7b:latest' ,
                temperature: 0,
            }
        );

        this._registry.setPrimary(config.primary ?? Clients.OllamaDefault);
    }
    
    /**
     * @property {ClientRegistry} registry
     * @description Gets the client registry.
     * @returns {ClientRegistry} The client registry.
     */
    public get registry(): ClientRegistry {
        return this._registry;
    }
}