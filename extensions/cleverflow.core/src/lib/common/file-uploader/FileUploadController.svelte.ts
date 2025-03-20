import AgentConnection from "../agent/AgentConnection.js";
import FileUploadAgentMessenger, { type OutPayload } from "./FileUploadAgentMessenger.js";

export default class FileUploadController {

    private servers: string | string[] = "";
    private token: string = "";
    private subject: string | null;

    private agentConnection?: AgentConnection;
    private fileUploadAgentMessenger?: FileUploadAgentMessenger;

    public modalShow = $state(true);

    constructor(servers: string | string[], token: string, subject: string) {
        this.servers = servers;
        this.token = token;
        this.subject = subject;
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
                subject: this.subject,
                onProcess: this.onProcess,
            });

            await this.fileUploadAgentMessenger.start();
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

    onProcess(inPayload: any): OutPayload {
        console.log('>>> Controller is here');
        this.modalShow = true;
        return {} as OutPayload;
    }

    upload(data: string) {
        this.modalShow = false;
        this.fileUploadAgentMessenger?.publish({
            data
        });
    }
}