/**
 * @file JsV8VmRunner.ts
 * @description This file contains the implementation of the `JsV8VmRunner` class, which provides a secure environment to run isolated JavaScript code with predefined utility functions.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import fs from "fs";
import path from "path";
import * as ftp from "basic-ftp";
import SftpClient from "ssh2-sftp-client";
import { WritableStreamBuffer } from "stream-buffers";
import vm from 'vm';
/**
 * @class JsV8VmRunner
 * @description The `JsV8VmRunner` class provides methods to run isolated JavaScript code in a secure sandboxed environment. It also allows adding custom utility functions to the sandbox.
 */
export class JsV8VmRunner {
    constructor() {
        /**
         * @property {Record<string, Function>} utilities
         * @description A collection of utility functions that can be used within the sandboxed environment.
         * @readonly
         */
        this.utilities = {
            /**
             * @function log
             * @description Logs a message to the console.
             * @param {string} message - The message to log.
             */
            log: (message) => {
                console.log(`[LOG]: ${message}`);
            },
            /**
             * @function load
             * @description Fetches data from a given URL.
             * @param {string} url - The URL to fetch data from.
             * @returns {Promise<string>} The response data as a string.
             * @throws {Error} If the fetch operation fails.
             */
            load: (filePathOrUrl) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
                        const response = yield axios.get(filePathOrUrl, {
                            headers: {
                                "Cache-Control": "no-cache",
                                "Access-Control-Allow-Origin": "*"
                            },
                        });
                        return response.data;
                    }
                    else if (filePathOrUrl.startsWith("ftp://")) {
                        const client = new ftp.Client();
                        client.ftp.verbose = true;
                        try {
                            const url = new URL(filePathOrUrl);
                            yield client.access({
                                host: url.hostname,
                                user: url.username || "anonymous",
                                password: url.password || "guest",
                            });
                            const bufferStream = new WritableStreamBuffer();
                            yield client.downloadTo(bufferStream, url.pathname);
                            return bufferStream.getContentsAsString("utf-8") || "";
                        }
                        finally {
                            client.close();
                        }
                    }
                    else if (filePathOrUrl.startsWith("sftp://")) {
                        const sftp = new SftpClient();
                        try {
                            const url = new URL(filePathOrUrl);
                            yield sftp.connect({
                                host: url.hostname,
                                username: url.username,
                                password: url.password,
                            });
                            const fileContent = yield sftp.get(url.pathname);
                            return fileContent.toString("utf-8");
                        }
                        finally {
                            sftp.end();
                        }
                    }
                    else if (filePathOrUrl.startsWith("file://")) {
                        const filePath = decodeURI(filePathOrUrl.replace("file://", ""));
                        return fs.readFileSync(filePath, "utf-8");
                    }
                    else if (filePathOrUrl.startsWith("data:")) {
                        const base64Content = filePathOrUrl.split(",")[1];
                        return Buffer.from(base64Content, "base64").toString("utf-8");
                    }
                    else {
                        // Assume local file path
                        const resolvedPath = path.resolve(filePathOrUrl.trim().replace(/\\/g, "/"));
                        return fs.readFileSync(resolvedPath, "utf-8");
                    }
                }
                catch (error) {
                    throw new Error(`Failed to load file: ${error.message}`);
                }
            }),
            /**
             * @function save
             * @description Sends data to a given URL.
             * @param {string} url - The URL to send data to.
             * @param {string} data - The data to send.
             * @returns {Promise<void>}
             * @throws {Error} If the save operation fails.
             */
            save: (url, data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios.post(url, { data }, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (response.status !== 200 && response.status !== 201) {
                        throw new Error(`Unexpected response status: ${response.status}`);
                    }
                }
                catch (error) {
                    throw new Error(`Failed to save: ${error.message}`);
                }
            }),
        };
    }
    /**
     * @method addUtilityFunction
     * @description Adds a custom utility function to the sandbox.
     * @param {string} name - The name of the utility function.
     * @param {Function} func - The utility function to add.
     * @throws {Error} If a utility function with the same name already exists.
     */
    addUtilityFunction(name, func) {
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
    runIsolatedCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
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
                return yield vm.runInContext(wrappedCode, sandbox, { timeout: 1000 }); // Timeout for safety
            }
            catch (error) {
                console.error(`[ERROR]: ${error}`);
            }
        });
    }
    /**
     * @method createSandbox
     * @description Creates a sandboxed environment with the provided utility functions.
     * @param {Record<string, Function>} utilities - The utility functions to include in the sandbox.
     * @returns {Record<string, unknown>} The sandboxed environment.
     * @private
     */
    createSandbox(utilities) {
        const sandbox = {};
        for (const [key, value] of Object.entries(utilities)) {
            sandbox[key] = value;
        }
        sandbox.console = console; // Optionally expose console for debugging
        return sandbox;
    }
}
