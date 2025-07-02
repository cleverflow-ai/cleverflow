import type { schema, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { generateBFlow } from './tasks/GenerateBFlow.js';
import { runBFlow } from './tasks/RunBFlow.js';
import { generateJsonForm } from './tasks/GenerateJsonForm.js';
import TASKS from './tasks/Tasks.js';
import matter from 'gray-matter';
import Session from './sessions/Session.js';
import sessionsManager from './sessions/SessionsManager.js';
import McpIO from './mcp/McpIO.js';
import _ from 'lodash';

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

    let session: Session;
    let clientSession: any;

    switch (task) {
        // GENERATE BFLOW
        case TASKS.GENERATE_BFLOW:
            await generateSession(sessionId, context);
            session = sessionsManager.getSession(sessionId);
            if (!session) {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'Session was not created!' }] }
                };
                return;
            }

            return yield* generateBFlow(session, context);
        // Run BFLOW
        case TASKS.RUN_BFLOW:
            session = sessionsManager.getSession(sessionId);
            if (!session) {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'Session was not created!' }] }
                };
                return;
            }
            return yield* runBFlow(session, context);
        // GENERATE JSON FORM
        case TASKS.GENERATE_JSON_FORM:
            session = sessionsManager.getSession(sessionId);
            return yield* generateJsonForm(session, context);
        // GET  FILE CONTENTS
        case TASKS.GET_FILE_CONTENTS:
            clientSession = extractClientSession(context);
            if (
                clientSession &&
                clientSession.url &&
                clientSession.token &&
                clientSession.branch &&
                clientSession.owner &&
                clientSession.repo &&
                clientSession.path
            ) {
                const result = await McpIO.getFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    clientSession.path
                );

                yield {
                    state: 'completed',
                    message: { role: 'agent', parts: [{ type: 'data', data: result.data }] }
                };
            } else {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'clientSession was not provided!' }] }
                };
            }
            break;
        // SAVE FILE CONTENT
        case TASKS.SAVE_FILE_CONTENT:
            const contentToSave = context.userMessage.parts.find((part) => part.type === 'text');
            clientSession = extractClientSession(context);
            if (
                clientSession &&
                clientSession.url &&
                clientSession.token &&
                clientSession.branch &&
                clientSession.owner &&
                clientSession.repo &&
                clientSession.path
            ) {
                const isFileSaved = await McpIO.saveFileContents(
                    clientSession.url,
                    clientSession.token,
                    clientSession.branch,
                    clientSession.owner,
                    clientSession.repo,
                    clientSession.path,
                    contentToSave.text
                )
                if (isFileSaved) {
                    yield {
                        state: 'completed',
                        message: { role: 'agent', parts: [{ type: 'text', text: '' }] }
                    };
                } else {
                    yield {
                        state: 'failed',
                        message: { role: 'agent', parts: [{ type: 'text', text: '' }] }
                    };
                }
            } else {
                yield {
                    state: 'failed',
                    message: { role: 'agent', parts: [{ type: 'text', text: 'clientSession was not provided!' }] }
                };
            }
            break;
        default:
            throw new Error(`Unknown task: ${task}`);
    }
}

const generateSession = async (sessionId: string, context: TaskContext): Promise<Session> => {
    const existedSession = sessionsManager.getSession(sessionId);
    if (existedSession) {
        return existedSession;
    }
    const textPart = context.userMessage.parts.find((part) => part.type === 'text');
    const text = textPart.text;
    const result = matter(text);
    const mcp = result.data?.MCP;
    const session = new Session(sessionId);

    for (const s of mcp) {
        if (s.url && s.name) {
            await session.addClient(s.url, s.name ?? '', s.description ?? '', s.version ?? '');
        } else {
            console.warn('[MCP] Skipped invalid MCP config:', s);
        }
    }

    sessionsManager.addSession(session);
    return session;
}

const extractClientSession = (context: TaskContext) => {
    let clientSession: any = context.userMessage.metadata?.session;
    if (clientSession) {
        return clientSession;
    }
    const userMessage: any = _.find(context.history, (userMessage) => {
        return userMessage.metadata?.session;
    });
    return userMessage?.metadata?.session;
}