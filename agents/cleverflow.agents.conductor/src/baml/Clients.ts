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
     * @constant {string} OllamaCode
     * @description The code client configuration identifier.
     */
    public static readonly OllamaCode = 'Ollama_Code';

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
                base_url: process.env.OLLAMA_OPENAI_URL,
                api_key: 'ollama',
                model: 'gemma3:12b',

                temperature: 0.1,
                top_p: 0.1,
                frequency_penalty: 1.5,
                presence_penalty: 0,
                repeat_penalty: 1.8,
                
                headers: {
                    "Api-Key": process.env.OLLAMA_API_KEY
                }
            }
        );

        this._registry.addLlmClient(
            Clients.OllamaTool,
            'openai-generic',
            {
                // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
                base_url: process.env.OLLAMA_OPENAI_URL,
                api_key: 'ollama',
                model: 'qwen2.5-coder:latest',

                temperature: 0.1,
                top_p: 0.1,
                frequency_penalty: 1.5,
                presence_penalty: 0,
                repeat_penalty: 1.8,

                headers: {
                    "Api-Key": process.env.OLLAMA_API_KEY
                }
            }
        );

        this._registry.addLlmClient(
            Clients.OllamaCode,
            'openai-generic',
            {
                // @ts-ignore: Object literal may only specify known properties, and 'base_url' does not exist in type '{ [x: number]: any; }'
                base_url: process.env.OLLAMA_OPENAI_URL,
                api_key: 'ollama',
                model: 'qwen2.5-coder:latest',

                temperature: 0.1,
                top_p: 0.1,
                frequency_penalty: 1.5,
                presence_penalty: 0,
                repeat_penalty: 1.8,

                headers: {
                    "Api-Key": process.env.OLLAMA_API_KEY
                }
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