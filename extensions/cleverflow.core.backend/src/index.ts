import MonitorAgent from './common/MonitorAgent.js';
import MarkdocCustomElementToBFlowAgent from './bflow/MarkdocCustomeElementToBFlowAgent.js';
import BFlowToBFlowVizAgent from './bflow/BFlowToBFlowVizAgent.js';
import JsV8VmRunner from './common/JsV8VmRunner.js';
import JsV8CodeGenerationAgent from './common/JsV8CodeGenerationAgent.js';

const monitorAgent = new MonitorAgent();

const markdocCustomElementToBFlowAgent = new MarkdocCustomElementToBFlowAgent();
monitorAgent.register(markdocCustomElementToBFlowAgent);

const bflowToBFlowVizAgent = new BFlowToBFlowVizAgent();
monitorAgent.register(bflowToBFlowVizAgent);

const jsV8VmRunner = new JsV8VmRunner();
const jsV8CodeGenerationAgent = new JsV8CodeGenerationAgent({ vmRunner: jsV8VmRunner });
monitorAgent.register(jsV8CodeGenerationAgent);

await Promise.all([
    monitorAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b'
    }),
    markdocCustomElementToBFlowAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b'
    }),
    bflowToBFlowVizAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b'
    }),
    jsV8CodeGenerationAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b'
    }),
]);

