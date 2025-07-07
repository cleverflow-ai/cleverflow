import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';
import McpIO from '../mcp/McpIO.js';
import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { extractClientSession } from './Util.js';

export async function* getFileContents(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
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
            const result = await McpIO.getFileContents(
                repoSettings.url,
                repoSettings.token,
                repoSettings.branch,
                repoSettings.owner,
                repoSettings.repo,
                clientSession.path
            );

            yield {
                state: 'completed',
                message: { role: 'agent', parts: [{ type: 'data', data: result.resource }] }
            };
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