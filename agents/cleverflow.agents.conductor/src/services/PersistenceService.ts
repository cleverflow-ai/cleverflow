import McpIO from "../mcp/McpIO";
import path from "path";
import _ from "lodash";
import GitFileReference from "../sessions/GitFileReference";
import Session from "../sessions/Session";

export default class PersistenceService {

    static async saveGenerateBFlow(session: Session, bflow: any, bflowviz: any): Promise<void> {
        try {
            const gitFileReference: GitFileReference = session.getGitFileReference();
            const instanceId = gitFileReference.hashedFileContent;
            const folderPath = path.dirname(gitFileReference.path);
            const fileNameWithoutExt = path.basename(gitFileReference.path, path.extname(gitFileReference.path));

            await McpIO.saveFileContents(
                gitFileReference.url,
                gitFileReference.token,
                gitFileReference.branch,
                gitFileReference.owner,
                gitFileReference.repo,
                `${folderPath}/${fileNameWithoutExt}-${instanceId}.bflow.json`,
                JSON.stringify(bflow),
            );

            await McpIO.saveFileContents(
                gitFileReference.url,
                gitFileReference.token,
                gitFileReference.branch,
                gitFileReference.owner,
                gitFileReference.repo,
                `${folderPath}/${fileNameWithoutExt}-${instanceId}.bflowviz.json`,
                JSON.stringify(bflowviz),
            );

        } catch (exception) {
            console.error(exception);
        }
    }

    static async saveRunBFlow(session: Session, outs: any): Promise<void> {
        try {
            const gitFileReference: GitFileReference = session.getGitFileReference();
            const instanceId = gitFileReference.hashedFileContent;
            const folderPath = path.dirname(gitFileReference.path);
            const fileNameWithoutExt = path.basename(gitFileReference.path, path.extname(gitFileReference.path));

            await McpIO.saveFileContents(
                gitFileReference.url,
                gitFileReference.token,
                gitFileReference.branch,
                gitFileReference.owner,
                gitFileReference.repo,
                `${folderPath}/${fileNameWithoutExt}-${instanceId}-${session.id}.bflowrun.json`,
                JSON.stringify(outs),
            );
        } catch (exception) {
            console.error(exception);
        }
    }

    static async saveRunBFlowNodeOutput(session: Session, nodeId: string, callToolResult: any): Promise<void> {
        try {
            const gitFileReference: GitFileReference = session.getGitFileReference();
            const instanceId = gitFileReference.hashedFileContent;
            const folderPath = path.dirname(gitFileReference.path);
            const fileNameWithoutExt = path.basename(gitFileReference.path, path.extname(gitFileReference.path));
            const pathToSave = `${folderPath}/${fileNameWithoutExt}-${instanceId}-${session.id}-${nodeId}.json`;
            callToolResult.resultLink = `${gitFileReference.getRepoAbsolutePath()}/${pathToSave}`;
            await McpIO.saveFileContents(
                gitFileReference.url,
                gitFileReference.token,
                gitFileReference.branch,
                gitFileReference.owner,
                gitFileReference.repo,
                pathToSave,
                JSON.stringify(callToolResult),
            );
        } catch (exception) {
            console.error(exception);
        }
    }
}