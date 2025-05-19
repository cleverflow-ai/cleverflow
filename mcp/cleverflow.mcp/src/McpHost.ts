import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Abstract base class for hosting an MCP (Model Context Protocol) server.
 * 
 * This class defines the basic structure and configuration for an MCP host,
 * including the default route path, server port, server type (stateful or stateless),
 * and a function to asynchronously retrieve an instance of `McpServer`.
 * 
 * Subclasses must implement the `start` and `stop` methods to control the server lifecycle.
 */
export default abstract class McpHost {
    /**
     * @param defaultRoutePath The base route path for the MCP server (default: '/mcp').
     * @param port The port number on which the server will listen (default: 3000).
     * @param type The type of server: 'stateful' or 'stateless' (default: 'stateful').
     * @param getMcpServer A function that returns a Promise resolving to an `McpServer` instance.
     */
    constructor(
        protected defaultRoutePath: string = '/mcp',
        protected port: number = 3000,
        protected type: 'stateful' | 'stateless' = 'stateful',
        protected getMcpServer: () => Promise<McpServer>) {
    }

    /**
     * Starts the MCP server.
     */
    public abstract start(): Promise<void>;

    /**
     * Stops the MCP server.
     */
    public abstract stop(): Promise<void>;
}