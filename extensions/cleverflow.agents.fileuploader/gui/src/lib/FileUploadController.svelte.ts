import { AgentConnection } from "@cleverflow-ai/cleverflow.core";
import FileUploadAgentMessenger, { type OutPayload } from "./FileUploadAgentMessenger.js";

export default class FileUploadController {

    private servers: string | string[] = "";
    private token: string = "";

    private agentConnection?: AgentConnection;
    private fileUploadAgentMessenger?: FileUploadAgentMessenger;

    public modalShow = $state(true);

    constructor(servers: string | string[], token: string) {
        this.servers = servers;
        this.token = token;
    }

    async connect() {
        try {
            this.agentConnection = new AgentConnection({ name: "file-uploader" });
            await this.agentConnection.connect({
                servers: this.servers,
                token: this.token,
            });

            this.fileUploadAgentMessenger = new FileUploadAgentMessenger({
                connection: this.agentConnection,
            });

        } catch (exception) {
            console.error(exception);
        }
    }

    async disconnect() {
        try {
            await this.fileUploadAgentMessenger?.stop();
            await this.agentConnection?.stop();
        } catch { }
    }

    async upload(fileToUpload: any) {
        return await this.fileUploadAgentMessenger?.upload(fileToUpload);
    }
}