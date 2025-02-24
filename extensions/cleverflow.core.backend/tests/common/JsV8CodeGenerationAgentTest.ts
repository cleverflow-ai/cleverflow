import JsV8VmRunner from "../../src/common/JsV8VmRunner.js";
import JsV8CodeGenerationAgent from "../../src/common/JsV8CodeGenerationAgent.js";

const jsV8VmRunner = new JsV8VmRunner();
const agent = new JsV8CodeGenerationAgent({ vmRunner: jsV8VmRunner });

const out = await agent.process({ 
    instructions: `
        1. Get Data from https://raw.githubusercontent.com/cleverflow-ai/examples/aaa3d881562450c4f0b26075c72e4624807629f4/machinery/machines-list.md

        2. Print downloaded data out.

        3. Filter the downloaded data to contain only those lines having Availability as 'Available':

        4. Based on 3, calculate the total lines.

        Return all results of 3 and 4 as a normal string.
    ` 
});
console.log(JSON.stringify(out));