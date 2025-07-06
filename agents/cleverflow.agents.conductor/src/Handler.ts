import type { schema, TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import { generateBFlow } from './tasks/GenerateBFlow.js';
import { runBFlow } from './tasks/RunBFlow.js';
import { generateJsonForm } from './tasks/GenerateJsonForm.js';
import { getFileContents } from './tasks/GetFileContents.js';
import { saveFileContent } from './tasks/SaveFileContent.js';
import TASKS from './tasks/Tasks.js';
import matter from 'gray-matter';
import Session from './sessions/Session.js';
import sessionsManager from './sessions/SessionsManager.js';
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

    switch (task) {
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

        case TASKS.GENERATE_JSON_FORM:
            session = sessionsManager.getSession(sessionId);
            return yield* generateJsonForm(session, context);

        case TASKS.GET_FILE_CONTENTS:
            return yield* getFileContents(session, context);

        case TASKS.SAVE_FILE_CONTENT:
            return yield* saveFileContent(session, context);

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