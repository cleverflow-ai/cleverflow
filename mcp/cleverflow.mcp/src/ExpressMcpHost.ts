import express from "express";
import { randomUUID } from "node:crypto";
import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import McpHost from "./McpHost.js";

/**
 * ExpressMcpHost is a concrete implementation of McpHost using Express.js.
 * 
 * This class sets up HTTP endpoints for the MCP server using Express, handling
 * session management, request routing, and transport lifecycle. It supports
 * stateful and stateless operation modes.
 * 
 * Endpoints:
 * - POST   /mcp : Handles client-to-server communication and session initialization.
 * - GET    /mcp : Handles server-to-client notifications via Server-Sent Events (SSE).
 * - DELETE /mcp : Handles session termination.
 * 
 * Session management is handled via the 'mcp-session-id' header.
 */
export default class ExpressMcpHost extends McpHost {
    protected app: express.Express;
    protected httpServer: http.Server;
    protected transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    /** HTTP header used for session identification. */
    public readonly SESSION_ID_HEADER = 'mcp-session-id';

    /**
     * Constructs an ExpressMcpHost.
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
        super(defaultRoutePath, port, type, getMcpServer);
    }

    /**
     * Starts the Express server and sets up HTTP endpoints for MCP communication.
     */
    public async start(): Promise<void> {
        this.app = express();

        this.app.use(express.json());

        // Handle POST requests for client-to-server communication
        this.app.post(this.defaultRoutePath, this.post);

        // Handle GET requests for server-to-client notifications via SSE
        this.app.get(this.defaultRoutePath, this.get);

        // Handle DELETE requests for session termination
        this.app.delete(this.defaultRoutePath, this.delete);

        this.httpServer = this.app.listen(this.port, (error) => {
            if (error) {
                console.error(`Error starting server: ${error}.`);
            } else {
                console.log(`Server is running on http://localhost:${this.port}${this.defaultRoutePath}.`);
            }
        });
    }

    /**
     * Stops the Express server and closes all active transports.
     */
    public async stop(): Promise<void> {
        // Close all transports
        for (const transport of Object.values(this.transports)) {
            await transport.close();
        }
        this.transports = {};

        // Close the HTTP Server
        this.httpServer.close((error) => {
            if (error) {
                console.error(`Error stopping server: ${error}.`);
            } else {
                console.log(`Server stopped successfully.`);
            }
        });
    }

    /**
     * Handles POST requests for client-to-server communication and session initialization.
     * - Reuses existing transport if session ID is provided and valid.
     * - Initializes a new session and transport if request is an initialization request.
     * - Responds with 400 if neither condition is met.
     */
    protected async post(req: express.Request, res: express.Response): Promise<void> {
        // Check for existing session ID
        const sessionId = req.headers[this.SESSION_ID_HEADER] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && this.transports[sessionId]) {
            // Reuse existing transport
            transport = this.transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
            // New initialization request
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: (sessionId) => {
                    // Store the transport by session ID
                    this.transports[sessionId] = transport;
                }
            });

            // Clean up transport when closed
            transport.onclose = () => {
                if (transport.sessionId) {
                    delete this.transports[transport.sessionId];
                }
            };

            const server = await this.getMcpServer();
            await server.connect(transport);
        } else {
            // Invalid request
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: 'Bad Request: No valid Session ID in Header.',
                },
                id: null,
            });
            return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
    }

    /**
     * Handles GET requests for server-to-client notifications via SSE.
     * Requires a valid session ID.
     */
    protected async get(req: express.Request, res: express.Response): Promise<void> {
        const sessionId = req.headers[this.SESSION_ID_HEADER] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing Session ID in Header.');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    }

    /**
     * Handles DELETE requests for session termination.
     * Requires a valid session ID.
     */
    protected async delete(req: express.Request, res: express.Response): Promise<void> {
        const sessionId = req.headers[this.SESSION_ID_HEADER] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing Session ID in Header.');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    }
}