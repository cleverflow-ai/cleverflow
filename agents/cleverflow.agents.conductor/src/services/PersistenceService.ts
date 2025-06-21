import { TaskContext } from "@cleverflow-ai/cleverflow.agents/server";
import McpIO from "../mcp/McpIO";
import path from "path";
import _ from "lodash";

export default class PersistenceService {

    static async saveGenerateBFlow(context: TaskContext, bflow: any, bflowviz: any): Promise<void> {
        try {
            const clientSession: any = PersistenceService.extractClientSession(context);

            console.log('>>>> clientSession');
            console.log(clientSession);

            if (
                clientSession &&
                clientSession.url &&
                clientSession.token &&
                clientSession.branch &&
                clientSession.owner &&
                clientSession.repo &&
                clientSession.path &&
                clientSession.hashedFileContent
            ) {
                const instanceId = clientSession.hashedFileContent;
                const folderPath = path.dirname(clientSession.path);

                await McpIO.saveFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    `${folderPath}/${instanceId}.bflow.json`,
                    JSON.stringify(bflow),
                );

                await McpIO.saveFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    `${folderPath}/${instanceId}.bflowviz.json`,
                    JSON.stringify(bflowviz),
                );
            }
        } catch (exception) {
            console.error(exception);
        }
    }

    static async saveRunBFlow(context: TaskContext, outs: any): Promise<void> {
        try {
            const clientSession: any = PersistenceService.extractClientSession(context);

            if (
                clientSession &&
                clientSession.id &&
                clientSession.url &&
                clientSession.token &&
                clientSession.branch &&
                clientSession.owner &&
                clientSession.repo &&
                clientSession.path &&
                clientSession.hashedFileContent
            ) {
                const instanceId = clientSession.hashedFileContent;
                const folderPath = path.dirname(clientSession.path);

                await McpIO.saveFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    `${folderPath}/${instanceId}-${clientSession.id}.bflowrun.json`,
                    JSON.stringify(outs),
                );
            }
        } catch (exception) {
            console.error(exception);
        }
    }

    static async saveRunBFlowNodeOutput(context: TaskContext, nodeId: string, nodeOutput: any): Promise<void> {
        try {
            const clientSession: any = PersistenceService.extractClientSession(context);

            if (
                clientSession &&
                clientSession.id &&
                clientSession.url &&
                clientSession.token &&
                clientSession.branch &&
                clientSession.owner &&
                clientSession.repo &&
                clientSession.path &&
                clientSession.hashedFileContent
            ) {
                const instanceId = clientSession.hashedFileContent;
                const folderPath = path.dirname(clientSession.path);

                await McpIO.saveFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    `${folderPath}/${instanceId}-${clientSession.id}-${nodeId}.json`,
                    JSON.stringify(nodeOutput),
                );
            }
        } catch (exception) {
            console.error(exception);
        }
    }

    static extractClientSession(context: TaskContext) {
        let clientSession: any = context.userMessage.metadata?.session;
        if (clientSession) {
            return clientSession;
        }
        const userMessage: any = _.find(context.history, (userMessage) => {
            return userMessage.metadata?.session;
        });
        return userMessage?.metadata?.session;
    }
}