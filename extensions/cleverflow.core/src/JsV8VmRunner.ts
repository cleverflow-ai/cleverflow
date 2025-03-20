/**
 * @file JsV8VmRunner.ts
 * @description This file contains the implementation of the `JsV8VmRunner` class, which provides a secure environment to run isolated JavaScript code with predefined utility functions.
 */

import axios from 'axios';
import vm from 'vm';

/**
 * @class JsV8VmRunner
 * @description The `JsV8VmRunner` class provides methods to run isolated JavaScript code in a secure sandboxed environment. It also allows adding custom utility functions to the sandbox.
 */
export class JsV8VmRunner {
    /**
     * @property {Record<string, Function>} utilities
     * @description A collection of utility functions that can be used within the sandboxed environment.
     * @readonly
     */
    public readonly utilities: Record<string, Function> = {
        /**
         * @function log
         * @description Logs a message to the console.
         * @param {string} message - The message to log.
         */
        log: (message: string) => {
            console.log(`[LOG]: ${message}`);
        },

        /**
         * @function load
         * @description Fetches data from a given URL.
         * @param {string} url - The URL to fetch data from.
         * @returns {Promise<string>} The response data as a string.
         * @throws {Error} If the fetch operation fails.
         */
        load: async (url: string): Promise<string> => {
            try {
                const response = await axios.get(
                    url,
                    {
                        headers: {
                            "Cache-Control": "no-cache",
                            "Access-Control-Allow-Origin": "*"
                        },
                    }
                );
                return response.data; // Return the response body
            } catch (error: any) {
                throw new Error(`Failed to fetch: ${error.message}`);
            }
        },

        /**
         * @function save
         * @description Sends data to a given URL.
         * @param {string} url - The URL to send data to.
         * @param {string} data - The data to send.
         * @returns {Promise<void>}
         * @throws {Error} If the save operation fails.
         */
        save: async (url: string, data: string): Promise<void> => {
            try {
                const response = await axios.post(url, { data }, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error(`Unexpected response status: ${response.status}`);
                }
            } catch (error: any) {
                throw new Error(`Failed to save: ${error.message}`);
            }
        },
    };

    /**
     * @method addUtilityFunction
     * @description Adds a custom utility function to the sandbox.
     * @param {string} name - The name of the utility function.
     * @param {Function} func - The utility function to add.
     * @throws {Error} If a utility function with the same name already exists.
     */
    public addUtilityFunction(name: string, func: Function): void {
        if (this.utilities[name]) {
            throw new Error(`Utility function "${name}" already exists.`);
        }
        this.utilities[name] = func;
    }

    /**
     * @method runIsolatedCode
     * @description Runs the provided JavaScript code in a secure sandboxed environment.
     * @param {string} code - The JavaScript code to run.
     * @returns {Promise<void>}
     * @throws {Error} If the code execution fails.
     */
    public async runIsolatedCode(code: string): Promise<any> {
        // Dynamically create the sandbox from utilities
        const sandbox = this.createSandbox(this.utilities);

        // Wrap the sandboxed context to make it secure
        vm.createContext(sandbox);

        // Wrap the user code in an async function to allow `await`
        const wrappedCode = `
            (async () => {
                ${code}
            })()
        `;

        try {
            // Run the code in the sandboxed context
            return await vm.runInContext(wrappedCode, sandbox, { timeout: 1000 }); // Timeout for safety
        } catch (error: unknown) {
            console.error(`[ERROR]: ${error}`);
        }
    }

    /**
     * @method createSandbox
     * @description Creates a sandboxed environment with the provided utility functions.
     * @param {Record<string, Function>} utilities - The utility functions to include in the sandbox.
     * @returns {Record<string, unknown>} The sandboxed environment.
     * @private
     */
    private createSandbox(utilities: Record<string, Function>): Record<string, unknown> {
        const sandbox: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(utilities)) {
            sandbox[key] = value;
        }
        sandbox.console = console; // Optionally expose console for debugging
        return sandbox;
    }
}
