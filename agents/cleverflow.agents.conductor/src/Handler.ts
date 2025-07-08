import type { schema, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { generateBFlow } from './tasks/GenerateBFlow.js';
import { runBFlow } from './tasks/RunBFlow.js';
import { generateJsonForm } from './tasks/GenerateJsonForm.js';
import TASKS from './tasks/Tasks.js';
import matter from 'gray-matter';
import Session from './sessions/Session.js';
import sessionsManager from './sessions/SessionsManager.js';
import _ from 'lodash';
import { extractClientSession } from './tasks/Util.js';
import GitFileReference from './sessions/GitFileReference.js';
import { b } from './baml_client/async_client.js';
import Clients from './baml/Clients.js';
import McpIO from './mcp/McpIO.js';
import md5 from 'md5';

export async function* handleTask(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

    const taskId = context.task.id;
    console.log(taskId);

    console.log(JSON.stringify(context));

    const [workspaceId, dataId, instanceId, sessionId, task] = taskId.split('|');
    console.log('workspaceId: ', workspaceId);
    console.log('dataId: ', dataId);
    console.log('instanceId: ', instanceId);
    console.log('sessionId: ', sessionId);
    console.log('task: ', task);

    let session: Session = generateSession(sessionId);

    switch (task) {

        case TASKS.GET_FILE_CONTENTS:
            const extractedGitFileReference = await extractGitFileReference(session, context);
            if (extractedGitFileReference) {
                session.setGitFileReference(extractedGitFileReference);
                const result = await McpIO.getFileContents(
                    extractedGitFileReference.url,
                    extractedGitFileReference.token,
                    extractedGitFileReference.branch,
                    extractedGitFileReference.owner,
                    extractedGitFileReference.repo,
                    extractedGitFileReference.path
                );

                extractedGitFileReference.setHashedFileContent(md5(JSON.stringify(result)));

                yield {
                    state: 'completed',
                    message: { role: 'agent', parts: [{ type: 'data', data: result.resource }] }
                };
                return;

            } else {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'Could not extract Git file reference from session or context.' }] }
                };
                return;
            }

        case TASKS.SAVE_FILE_CONTENT:
            const textPart = context.userMessage.parts.find((part) => part.type === 'text');
            const gitFileReference = session.getGitFileReference();
            if (textPart) {
                const isFileSaved = await McpIO.saveFileContents(
                    gitFileReference.url,
                    gitFileReference.token,
                    gitFileReference.branch,
                    gitFileReference.owner,
                    gitFileReference.repo,
                    gitFileReference.path,
                    textPart.text
                )
                if (isFileSaved) {
                    yield {
                        state: 'completed',
                        message: { role: 'agent', parts: [{ type: 'text', text: '' }] }
                    };
                } else {
                    yield {
                        state: 'failed',
                        message: { role: 'agent', parts: [{ type: 'text', text: 'Cannot save file content' }] }
                    };
                }
            } else {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'Failed to save file: user message does not contain any text part.' }] }
                };
                return;
            }

        case TASKS.GENERATE_BFLOW:
            await initializeMCPForSession(session, context);
            return yield* generateBFlow(session, context);

        case TASKS.RUN_BFLOW:
            return yield* runBFlow(session, context);

        case TASKS.GENERATE_JSON_FORM:
            return yield* generateJsonForm(session, context);

        default:
            throw new Error(`Unknown task: ${task}`);
    }
}

const generateSession = (sessionId: string): Session => {
    const existedSession = sessionsManager.getSession(sessionId);
    if (existedSession) {
        return existedSession;
    }
    const session = new Session(sessionId);
    sessionsManager.addSession(session);
    return session;
}

const initializeMCPForSession = async (session: Session, context: TaskContext): Promise<void> => {

    session.clearMcpClients();

    const textPart = context.userMessage.parts.find((part) => part.type === 'text');
    const text = textPart.text;
    const result = matter(text);
    const mcp = result.data?.MCP;

    for (const s of mcp) {
        if (s.url && s.name) {
            await session.registerMcpClient(s.url, s.name ?? '', s.description ?? '', s.version ?? '');
        } else {
            console.warn('[MCP] Skipped invalid MCP config:', s);
        }
    }
}

const extractGitFileReference = async (session: Session, context: TaskContext): Promise<GitFileReference | null> => {
    const clientSession = extractClientSession(context);
    if (
        clientSession &&
        clientSession.url &&
        clientSession.token &&
        clientSession.branch &&
        clientSession.owner &&
        clientSession.repo &&
        clientSession.path
    ) {
        let gitFileReference = new GitFileReference(
            clientSession.url,
            clientSession.token,
            clientSession.branch,
            clientSession.owner,
            clientSession.url.repo,
            clientSession.path,
        );
        return gitFileReference;

    } else if (clientSession && clientSession.commonSettings) {
        const repoSettings = await b.GetRepoIntegrationSettings(
            clientSession.commonSettings,
            {
                clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
            }
        );
        if (
            repoSettings &&
            repoSettings.url &&
            repoSettings.token &&
            repoSettings.branch &&
            repoSettings.owner &&
            repoSettings.repo &&
            clientSession.path
        ) {
            let gitFileReference = new GitFileReference(
                repoSettings.url,
                repoSettings.token,
                repoSettings.branch,
                repoSettings.owner,
                repoSettings.repo,
                clientSession.path,
            );
            return gitFileReference;
        }
    }
    return null;
}