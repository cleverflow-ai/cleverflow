import express from "express";
import { randomUUID } from "node:crypto";
import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"

export default class ExpressHost {
    protected app: express.Express;
    protected httpServer: http.Server;
    protected transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    private readonly sessionIdHeaderParam = 'mcp-session-id';

    constructor(
        protected defaultRoutePath: string = '/mcp', 
        protected port: number = 3000, 
        protected type: 'stateful' | 'stateless' = 'stateful',
        protected getMcpServer: () => Promise<McpServer>) {
    }

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
                console.error(`Error starting server: ${error}`);
            } else {
                console.log(`Server is running on http://localhost:${this.port}${this.defaultRoutePath}`);
            }
        });
    }

    public async stop(): Promise<void> {
        // Close all transports
        for (const transport of Object.values(this.transports)) {
            await transport.close();
        }
        this.transports = {};

        // Close the HTTP Server
        this.httpServer.close((error) => {
            if (error) {
                console.error(`Error stopping server: ${error}`);
            } else {
                console.log(`Server stopped successfully.`);
            }
        });
    }

    protected async post(req: express.Request, res: express.Response) : Promise<void> {
        // Check for existing session ID
        const sessionId = req.headers[this.sessionIdHeaderParam] as string | undefined;
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
                    message: 'Bad Request: No valid Session ID provided',
                },
                id: null,
            });
            return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
    }

    protected async get(req: express.Request, res: express.Response): Promise<void> {
        const sessionId = req.headers[this.sessionIdHeaderParam] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing Session ID');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    }

    protected async delete(req: express.Request, res: express.Response): Promise<void> {
        const sessionId = req.headers[this.sessionIdHeaderParam] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing Session ID');
            return;
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res);
    }
}