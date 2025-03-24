var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * The Agent class is an abstract base class for creating agents that connect to a NATS server,
 * subscribe to a subject, process incoming messages, and respond with processed results.
 *
 * @abstract
 */
/**
 * @file AgentMessenger.ts
 * @description Defines the abstract AgentMessenger class for managing agent connections and message processing.
 *
 * @template In - The type of the incoming message payload.
 * @template Out - The type of the outgoing message payload.
 */
/**
   * Abstract class representing an agent messenger that handles connections and message processing.
   *
   * @template In - The type of the incoming message payload.
   * @template Out - The type of the outgoing message payload.
   */
export class AgentMessenger {
    /**
     * Constructs an Agent instance.
     *
     * @param {Partial<{ subject: string }>} config - Configuration object containing the agent's subject.
     */
    constructor(config) {
        this.connection = config.connection;
        this.subject = config.subject;
    }
    /**
     * Stops the agent by draining the subscription and closing the connection.
     *
     * @returns {Promise<void>}
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.subscription) {
                // Notes:
                // 1. `unsubscribe()` is immediate and does not guarantee processing of pending messages.
                // 2. `drain()` ensures all pending messages are processed before unsubscribing.
                // 3. For asynchronous subscriptions, you can also use the `max` option to automatically unsubscribe after receiving a specified number of messages.
                this.subscription.drain();
                this.subscription = null;
                console.log(`Agent ${this.subject} was disconnected.`);
            }
        });
    }
    /**
     * Subscribes to a subject to start processing messages.
     *
     * @param {Partial<{ servers: string | string[], token: string, subject: string }>} config - Configuration object containing server details, token, and subject.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the subject is not provided.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                throw new Error('Connection is not established');
            }
            yield this.stop();
            if (this.subject) {
                this.subscription = yield this.connection.subscribe({ subject: this.subject });
                console.log(`Agent is now listening to ${this.subject}.`);
            }
            else {
                throw new Error('Subject is required to subscribe.');
            }
            if (this.subscription) {
                this.subscription.callback = (err, message) => {
                    var _a;
                    const inPayload = (_a = this.connection) === null || _a === void 0 ? void 0 : _a.codec.decode(message.data);
                    console.log(`Agent ${this.subject} received: ${JSON.stringify(inPayload)}.`);
                    this.process(inPayload);
                };
            }
        });
    }
    /**
     * Sends a request with the specified payload and returns the response.
     *
     * This method utilizes an established connection to send a request to a remote service.
     * The payload is encoded using the connection's codec before being sent. The method
     * also specifies a timeout of 1 hour for the request.
     *
     * @template In - The type of the input payload.
     * @template Out - The type of the expected response.
     *
     * @param {In} payload - The data to be sent with the request.
     * @returns {Promise<Out>} A promise that resolves with the response of type `Out`.
     *
     * @throws {Error} Throws an error if the connection is not established.
     */
    request(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                console.log(`Agent ${this.subject} requested: ${JSON.stringify(payload)}.`);
                return yield this.connection.sendRequest({
                    subject: this.subject,
                    payload: this.connection.codec.encode(payload),
                    options: {
                        timeout: 3600 * 1000 // 1 hour 
                    },
                });
            }
            else {
                throw new Error('Connection is not established');
            }
        });
    }
    /**
     * Publishes a message to the specified subject using the established connection.
     *
     * @param payload - The message payload to be published. It is encoded using the connection's codec.
     * @throws {Error} Throws an error if the connection is not established.
     */
    publish(payload) {
        var _a;
        if (this.connection) {
            this.connection.publish({
                subject: (_a = this.subject) !== null && _a !== void 0 ? _a : '',
                payload: payload,
            });
        }
        else {
            throw new Error('Connection is not established');
        }
    }
}
