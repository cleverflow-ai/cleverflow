import MarkdocCustomElementToBFlowAgent from './bflow/MarkdocCustomeElementToBFlowAgent.js';

const markdocCustomElementToBFlowAgent = new MarkdocCustomElementToBFlowAgent();
await markdocCustomElementToBFlowAgent.run({ 
    servers: 'localhost:4222', 
    token: '76de3ba222bec3af21f9dbfb01f3197b', 
    subject: 'markdoc-custom-element-to-bflow' 
});
