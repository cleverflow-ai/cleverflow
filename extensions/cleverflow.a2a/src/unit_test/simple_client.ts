import crypto from "node:crypto";
import { A2AClient } from "../client/client.js";
import {
    TaskSendParams,
} from "../schema.js";

(async () => {
    const currentTaskId = crypto.randomUUID();
    const serverUrl = "http://localhost:41241";
    const client = new A2AClient(serverUrl);
    const params: TaskSendParams = {
        // Use the specific Params type
        id: "ab541069-155d-4f20-be20-00e4ad9e2d42", // The actual Task ID
        message: {
            role: "user",
            parts: [{ type: "text", text: 'hello server: ' + new Date().toISOString() }], // Ensure type: "text" is included if your schema needs it
        },
    };

    try {
        console.log("Sending...");
        console.log(JSON.stringify(params, null, 2)); // Indicate request is sent
        // Pass only the params object to the client method
        const stream = client.sendTaskSubscribe(params);
        // Iterate over the unwrapped event payloads
        for await (const event of stream) {
            console.log(event);
        }
    } catch (error: any) {
        console.error(
            error.message || error
        );
        if (error.code) {
            console.error(`Code: ${error.code}`);
        }
        if (error.data) {
            console.error(`Data: ${JSON.stringify(error.data)}`);
        }
    }
})();