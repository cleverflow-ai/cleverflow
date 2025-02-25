import JsV8VmRunner from "../../src/common/JsV8VmRunner.js";
import JsV8CodeGenerationAgent from "../../src/common/JsV8CodeGenerationAgent.js";

const jsV8VmRunner = new JsV8VmRunner();
const agent = new JsV8CodeGenerationAgent({ vmRunner: jsV8VmRunner });

const out1 = await agent.process({ 
    description: `
        1. Get List of all Machine:
    `,
    config: `
        url: https://raw.githubusercontent.com/cleverflow-ai/examples/aaa3d881562450c4f0b26075c72e4624807629f4/machinery/machines-list.md
    `,
    input: null
});
console.log(`Result 1: `);
console.log(JSON.stringify(out1));

const out2 = await agent.process({ 
    description: `
        2. Filter the given List of Machines:
    `,
    config: `
        filter condition: only lines having Availability as 'available'.
    `,
    input: out1.result
});
console.log(`Result 2: `);
console.log(JSON.stringify(out2));