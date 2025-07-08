import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';
import PersistenceService from '../services/PersistenceService.js';

export async function* generateBFlow(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_MARKDOC_ELEMENT_TO_BFLOW'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    const textPart = context.userMessage.parts.find((part) => part.type === 'text');

    if (!textPart || !textPart.text) {
        yield {
            state: 'input-required',
            message: {
                role: 'agent',
                parts: [{
                    type: 'text',
                    text: 'text was missing'
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
    const text = textPart.text;

    const bflow = await b.ParseMarkdocBFlowElementToBFlow(
        text,
        session.getMcpClientTools(),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_BFLOW_TO_BFLOWVIZ'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    const bflowviz = await b.ParseBFlowToBFlowViz(
        JSON.stringify(bflow),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{
                type: 'text',
                text: 'CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS'
            }, {
                type: 'data',
                data: {
                    createdAt: new Date(),
                }
            }]
        }
    };

    await PersistenceService.saveGenerateBFlow(session, bflow, bflowviz);

    yield {
        state: 'completed',
        message: {
            role: 'agent',
            parts: [{
                type: 'data',
                data: {
                    bflow,
                    bflowviz
                }
            }]
        }
    };
}