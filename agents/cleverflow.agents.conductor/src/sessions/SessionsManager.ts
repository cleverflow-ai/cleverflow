
import Session from "./Session";
import _ from 'lodash';

type McpClientTool = {
    name: string;
}

class SessionsManager {

    private sessions: Session[] = [];

    constructor() {
    }


    addSession(session: Session) {
        this.sessions.push(session);
    }

    getSession(sessionId: string) {
        return _.find(this.sessions, (session: Session) => {
            return session.id === sessionId;
        });
    }

    // async getMcpClient(taskId: string, serverUrl: string, name: string, version: string): Promise<McpClient | null> {
    //     try {
    //         const client = await createMcpClient(serverUrl, name, version);
    //         if (client) {
    //             const result = await client.listTools();
    //             const mcpClient: McpClient = {
    //                 taskId,
    //                 serverUrl,
    //                 name,
    //                 description: '',
    //                 version,
    //                 client,
    //                 tools: result.tools
    //             };

    //             return mcpClient;
    //         }
    //     } catch (error) {
    //         console.error(`Failed to create MCP client for ${name} at ${serverUrl}:`, error);
    //     }
    //     return null;
    // }

    // getClient(taskId: string, name: string): McpClient | null {
    //     if (this.clients.has(taskId)) {
    //         const list = this.clients.get(taskId);
    //         return list.find((c) => c.name === name);
    //     }
    //     return null;
    // }

    // listTools(taskId: string): McpClientTool[] {
    //     if (this.clients.has(taskId)) {
    //         const list = this.clients.get(taskId);
    //         return list.flatMap((c) => c.tools.map((tool) => ({ name: tool.name })));
    //     }
    //     return [];
    // }

    // getClientByToolName(taskId: string, toolName: string): McpClient | null {
    //     if (this.clients.has(taskId)) {
    //         const list = this.clients.get(taskId);
    //         return list.find((c) => c.tools.some((tool) => tool.name === toolName));
    //     }
    //     return null;
    // }
}

const sessionsManager = new SessionsManager();

export default sessionsManager;