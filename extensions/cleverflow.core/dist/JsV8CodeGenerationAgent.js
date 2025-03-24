var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Clients from "../../cleverflow.core.backend/src/baml/Clients.js";
import { b } from "../../cleverflow.core.backend/src/baml_client/async_client.js";
import Agent from "./Agent.js";
/**
 * JsV8CodeGenerationAgent is an agent responsible for generating and executing JavaScript (V8) code.
 * This agent can be used to execute tasks ad hoc and can serve as a default agent.
 *
 * @extends Agent<InPayload, OutPayload>
 */
export default class JsV8CodeGenerationAgent extends Agent {
    /**
     * Constructs a new JsV8CodeGenerationAgent.
     *
     * @param config - Partial configuration object containing an optional JsV8VmRunner instance.
     */
    constructor(config) {
        super({
            name: 'js-v8-code-generation',
            description: `
                Generate Javascript (V8) code for executing Task ad hoc.
                Can be used as default Agent.
            `
        });
        this._vmRunner = config.vmRunner;
    }
    /**
     * Processes the given payload by generating JavaScript (V8) code and executing it.
     *
     * @param payload - The input payload containing instructions for code generation.
     * @returns A promise that resolves to the output payload containing the generated code and its execution result.
     * @throws {Error} If no VMRunner is assigned.
     */
    process(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._vmRunner) {
                throw new Error('No VMRunner is assigned.');
            }
            let instructions = ``;
            if (payload.inputs) {
                instructions += 'Given the Input Data:';
                payload.inputs.forEach((input) => {
                    instructions += '\n';
                    if (typeof input === 'string') {
                        instructions += input;
                    }
                    else if (typeof input === 'object') {
                        instructions += JSON.stringify(input, null, 2);
                    }
                });
            }
            if (payload.description) {
                instructions += '\n\n';
                instructions += payload.description;
            }
            if (payload.config) {
                instructions += '\n\n';
                instructions += payload.config;
            }
            console.log('>>>>> instructions');
            console.log(instructions);
            const generated = yield b.GenerateJSV8Code(instructions, `
            log(): void                                     // For printing and debugging purpose.
            load(url: string): Promise<string>              // For downloading or fetching file with a given URL. Usage: await load(...).
            save(url: string, data: string): Promise<void>  // For saving file with a given destination URL. Usage: await save(...).
            `, {
                clientRegistry: new Clients({ primary: Clients.OllamaCode }).registry
            });
            if (generated === null || generated === void 0 ? void 0 : generated.code) {
                try {
                    const result = yield this._vmRunner.runIsolatedCode(generated.code);
                    return { code: generated.code, result: result };
                }
                catch (exception) {
                    return { code: generated.code, result: exception };
                }
            }
            return { code: '', result: null };
        });
    }
}
