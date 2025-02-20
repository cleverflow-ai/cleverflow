import MarkdocCustomElementToBFlowAgent from './bflow/MarkdocCustomeElementToBFlowAgent.js';
import BFlowToBFlowVizAgent from './bflow/BFlowToBFlowVizAgent.js';

const markdocCustomElementToBFlowAgent = new MarkdocCustomElementToBFlowAgent();
const bflowToBFlowVizAgent = new BFlowToBFlowVizAgent();

await Promise.all([
    markdocCustomElementToBFlowAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b', 
        subject: 'markdoc-custom-element-to-bflow' 
    }),
    bflowToBFlowVizAgent.run({ 
        servers: 'localhost:4222', 
        token: '76de3ba222bec3af21f9dbfb01f3197b', 
        subject: 'bflow-to-bflowviz' 
    })
]);