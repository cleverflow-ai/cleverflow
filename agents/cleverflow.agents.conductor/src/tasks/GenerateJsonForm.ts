import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import Session from '../sessions/Session.js';

export async function* generateJsonForm(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    const dataPart = context.userMessage.parts.find((part) => part.type === 'data');

    if (!dataPart || !dataPart.data || !dataPart.data.inputSchema) {
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'Input schema was missing'
                }, {
                    type: 'data',
                    data: {
                        createdAt: new Date(),
                    }
                }]
            }
        };
        return;
    }

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: `Working on it...`
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    const inputSchema = dataPart.data.inputSchema;

    const jsonForm = await b.ConvertToJsonForm(
        JSON.stringify(inputSchema),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
        });

    yield {
        state: 'completed',
        message: {
            role: 'agent',
            parts: [{
                type: 'data',
                data: {
                    jsonForm
                }
            }]
        }
    };
}

