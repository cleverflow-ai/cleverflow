import JsV8VmRunner from "../../src/common/JsV8VmRunner.js";
import JsV8CodeGenerationAgent from "../../src/common/JsV8CodeGenerationAgent.js";

const jsV8VmRunner = new JsV8VmRunner();
const agent = new JsV8CodeGenerationAgent({ vmRunner: jsV8VmRunner });

const out = await agent.process({ 
    instructions: `
        1. Filter the following Markdown Table to contain only those lines having Availability as 'Available':

        | Machine Model | Machine Line | Availability | Target Types of Cakes      |
        |---------------|--------------|--------------|----------------------------|
        | Model A1      | Line 1       | Available    | Cupcake, Muffin            |
        | Model B2      | Line 2       | Available    | Cake, Sponge Cake          |
        | Model C3      | Line 3       | Unavailable  | Cheesecake, Brownie        |
        | Model D4      | Line 4       | Available    | Tart, Pie                  |
        | Model E5      | Line 5       | Maintenance  | Cupcake, Cake              |
        | Model F6      | Line 6       | Available    | Sponge Cake, Muffin        |
        | Model G7      | Line 7       | Available    | Cheesecake, Tart           |
        | Model H8      | Line 8       | Unavailable  | Brownie, Pie               |
        | Model I9      | Line 9       | Available    | Cupcake, Cheesecake        |
        | Model J10     | Line 10      | Available    | Muffin, Tart               |
        | Model K11     | Line 11      | Maintenance  | Cake, Brownie              |
        | Model L12     | Line 12      | Available    | Pie, Cheesecake            |
        | Model M13     | Line 13      | Available    | Tart, Sponge Cake          |
        | Model N14     | Line 14      | Unavailable  | Cupcake, Cake              |
        | Model O15     | Line 15      | Available    | Muffin, Brownie            |
        | Model P16     | Line 16      | Available    | Cheesecake, Pie            |
        | Model Q17     | Line 17      | Maintenance  | Tart, Cupcake              |
        | Model R18     | Line 18      | Available    | Sponge Cake, Cake          |
        | Model S19     | Line 19      | Available    | Muffin, Cheesecake         |
        | Model T20     | Line 20      | Unavailable  | Tart, Brownie              |

        2. Based on 1, calculate the total lines.

        Return result of 1 and 2 as a normal string.
    ` 
});
console.log(JSON.stringify(out));