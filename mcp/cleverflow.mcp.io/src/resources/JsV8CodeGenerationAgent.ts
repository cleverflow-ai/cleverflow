// import Clients from "../../../../extensions/cleverflow.agents.generalpurposes/src/baml/Clients.js";
// import { b } from "../../../../extensions/cleverflow.agents.generalpurposes/src/baml_client/async_client.js";
// import { JsV8Code } from "../../../../extensions/cleverflow.agents.generalpurposes/src/baml_client/types.js";
// import { Agent, JsV8VmRunner } from "@cleverflow-ai/cleverflow.core";

// export type InPayload = {
//     description: string;
//     config: string;
//     inputs: any[];
// }

// export type OutPayload = {
//     code: string;
//     result: any;
// }

// /**
//  * JsV8CodeGenerationAgent is an agent responsible for generating and executing JavaScript (V8) code.
//  * This agent can be used to execute tasks ad hoc and can serve as a default agent.
//  *
//  * @extends Agent<InPayload, OutPayload>
//  */
// export default class JsV8CodeGenerationAgent extends Agent<InPayload, OutPayload> {
//     private _vmRunner: JsV8VmRunner | undefined;

//     /**
//      * Constructs a new JsV8CodeGenerationAgent.
//      *
//      * @param config - Partial configuration object containing an optional JsV8VmRunner instance.
//      */
//     constructor(config: Partial<{ vmRunner: JsV8VmRunner }>) {
//         super({
//             name: 'js-v8-code-generation',
//             description: `
//                 Generate Javascript (V8) code for executing Task ad hoc.
//                 Can be used as default Agent.
//             `
//         });

//         this._vmRunner = config.vmRunner;
//     }

//     /**
//      * Processes the given payload by generating JavaScript (V8) code and executing it.
//      *
//      * @param payload - The input payload containing instructions for code generation.
//      * @returns A promise that resolves to the output payload containing the generated code and its execution result.
//      * @throws {Error} If no VMRunner is assigned.
//      */
//     public async process(payload: InPayload): Promise<OutPayload> {
//         if (!this._vmRunner) {
//             throw new Error('No VMRunner is assigned.');
//         }

//         let instructions = ``;

//         if (payload.inputs) {
//             instructions += 'Given the Input Data:';

//             payload.inputs.forEach((input) => {
//                 instructions += '\n';

//                 if (typeof input === 'string') {
//                     instructions += input;
//                 } else if (typeof input === 'object') {
//                     instructions += JSON.stringify(input, null, 2);
//                 }
//             });
//         }

//         if (payload.description) {
//             instructions += '\n\n';
//             instructions += payload.description;
//         }

//         if (payload.config) {
//             instructions += '\n\n';
//             instructions += payload.config;
//         }

//         console.log('>>>>> instructions');
//         console.log(instructions);

//         const generated: JsV8Code = await b.GenerateJSV8Code(
//             instructions,
//             `
//             log(): void                                     // For printing and debugging purpose.
//             load(url: string): Promise<string>              // For downloading or fetching file with a given URL. Usage: await load(...).
//             save(url: string, data: string): Promise<void>  // For saving file with a given destination URL. Usage: await save(...).
//             `,
//             {
//                 clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
//             }
//         );

//         if (generated?.code) {
//             try {
//                 const result = await this._vmRunner.runIsolatedCode(generated.code);
//                 return { code: generated.code, result: result };
//             } catch (exception) {
//                 return { code: generated.code, result: exception };
//             }

//         }

//         return { code: '', result: null };
//     }
// }