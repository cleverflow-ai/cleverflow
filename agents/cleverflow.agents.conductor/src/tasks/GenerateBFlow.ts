import { b } from '../baml_client/async_client.js';
import Clients from '../baml/Clients.js';
import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
import _ from 'lodash';
import Session from '../sessions/Session.js';

export async function* generateBFlow(session: Session, context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'CONVERT_MARKDOC_ELEMENT_TO_BFLOW' }]
        }
    };

    const textPart = context.userMessage.parts.find((part) => part.type === 'text');

    if (!textPart || !textPart.text) {
        yield {
            state: 'input-required',
            message: { role: 'agent', parts: [{ type: 'text', text: 'text was missing' }] }
        };
        return;
    }
    const text = textPart.text;

    const bflow = await b.ParseMarkdocBFlowElementToBFlow(
        text,
        session.getMcpClientInfo(),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'CONVERT_BFLOW_TO_BFLOWVIZ' }]
        }
    };

    const bflowViz = await b.ParseBFlowToBFlowViz(
        JSON.stringify(bflow),
        {
            clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
        });

    yield {
        state: 'working',
        message: {
            role: 'agent',
            parts: [{ type: 'text', text: 'CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS' }]
        }
    };

    yield {
        state: 'completed',
        message: {
            role: 'agent',
            parts: [{
                type: 'data',
                data: {
                    bflow,
                    bflowViz
                }
            }]
        }
    };
}