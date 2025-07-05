import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';
import McpIO from '../mcp/McpIO.js';
import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';

export async function* saveFileContent(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    const contentToSave = context.userMessage.parts.find((part) => part.type === 'text');
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
                message: { role: 'agent', parts: [{ type: 'text', text: 'Cannot save file content' }] }
            };
        }
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
            const isFileSaved = await McpIO.saveFileContents(
                repoSettings.url,
                repoSettings.token,
                repoSettings.branch,
                repoSettings.owner,
                repoSettings.repo,
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
                    message: { role: 'agent', parts: [{ type: 'text', text: 'Cannot save file content' }] }
                };
            }
        } else {
            yield {
                state: 'failed',
                message: { role: 'agent', parts: [{ type: 'text', text: 'repoSettings was not provided!' }] }
            };
        }
    } else {
        yield {
            state: 'failed',
            message: { role: 'agent', parts: [{ type: 'text', text: 'repoSettings was not provided!' }] }
        };
    }
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