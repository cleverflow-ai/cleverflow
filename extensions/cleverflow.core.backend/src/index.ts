import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();
console.log('BAML Log Level:', process.env.BAML_LOG);

import { monitorAgent, JsV8VmRunner } from '@cleverflow/cleverflow.core';
import MarkdocCustomElementToBFlowAgent from './bflow/MarkdocCustomeElementToBFlowAgent.js';
import BFlowToBFlowVizAgent from './bflow/BFlowToBFlowVizAgent.js';
import JsV8CodeGenerationAgent from './common/JsV8CodeGenerationAgent.js';
import BFlowRunnerAgent from './bflow/BFlowRunnerAgent.js';
import FileUploaderAgent from './file-uploader/FileUploaderAgent.js';

const eventsServer = process.env.EVENTS_SERVER;
const eventsToken = process.env.EVENTS_TOKEN;

const markdocCustomElementToBFlowAgent = new MarkdocCustomElementToBFlowAgent();
monitorAgent.register(markdocCustomElementToBFlowAgent);

const bflowToBFlowVizAgent = new BFlowToBFlowVizAgent();
monitorAgent.register(bflowToBFlowVizAgent);

const jsV8VmRunner = new JsV8VmRunner();
const jsV8CodeGenerationAgent = new JsV8CodeGenerationAgent({ vmRunner: jsV8VmRunner });
monitorAgent.register(jsV8CodeGenerationAgent);

const bflowRunnerAgent = new BFlowRunnerAgent();
monitorAgent.register(bflowRunnerAgent);

const fileUploaderAgent = new FileUploaderAgent();
monitorAgent.register(fileUploaderAgent);

await Promise.all([
    monitorAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
    markdocCustomElementToBFlowAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
    bflowToBFlowVizAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
    jsV8CodeGenerationAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
    bflowRunnerAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
    fileUploaderAgent.run({
        servers: eventsServer,
        token: eventsToken
    }),
]);

