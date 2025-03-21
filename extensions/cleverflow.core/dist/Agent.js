var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { connect } from 'nats';
/**
 * The Agent class is an abstract base class for creating agents that connect to a NATS server,
 * subscribe to a subject, process incoming messages, and respond with processed results.
 *
 * @abstract
 */
/**
 * Abstract class representing an Agent that processes messages from a NATS server.
 *
 * @template In - The type of the incoming message payload.
 * @template Out - The type of the outgoing message payload.
 *
 * @implements {AgentInfo}
 */
export class Agent {
    /**
     * Constructs an Agent instance.
     *
     * @param {Partial<{ name: string, description: string }>} config - Configuration object containing the agent's name and description.
     */
    constructor(config) {
        this.codec = JSONCodec();
        this.name = config.name;
        this.description = config.description;
    }
    /**
     * Connects to the NATS server and subscribes to a subject to start processing messages.
     *
     * @param {Partial<{ servers: string | string[], token: string, subject: string }>} config - Configuration object containing server details, token, and subject.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the subject is not provided.
     */
    run() {
        return __awaiter(this, arguments, void 0, function* (config = {}) {
            const defaultConfig = {
                servers: 'localhost:4222',
                token: '76de3ba222bec3af21f9dbfb01f3197b',
                subject: this.name
            };
            config = Object.assign(Object.assign({}, defaultConfig), config);
            if (!this.connection) {
                this.connection = yield this.connect(config);
                console.log(`Agent ${this.name} was connected.`);
            }
            if (!this.subscription) {
                if (config.subject) {
                    this.subscription = this.connection.subscribe(`${config.subject}.server`);
                    console.log(`Agent ${this.name} is now listening to ${config.subject}.`);
                }
                else {
                    throw new Error('Subject is required to subscribe.');
                }
                if (this.subscription) {
                    this.subscription.callback = (err, message) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.error(`Agent ${this.name} Error receiving message:`, err);
                        }
                        else {
                            // process messages
                            const inPayload = JSONCodec().decode(message.data);
                            console.log(`[Agent ${this.name} received]:`);
                            console.log(JSON.stringify(inPayload));
                            const outPayload = yield this.process(inPayload);
                            const encodedOutPayload = JSONCodec().encode(outPayload);
                            message.respond(encodedOutPayload);
                            console.log(`[Agent ${this.name} replied]:`);
                            console.log(JSON.stringify(outPayload));
                        }
                    });
                }
            }
        });
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
                console.log(`Agent ${this.name} was disconnected.`);
            }
            if (this.connection) {
                this.connection.close();
                this.connection = null;
                console.log(`Agent ${this.name} was drained and is not listening to any subject.`);
            }
        });
    }
    /**
     * Publishes a message to a specified subject using the underlying connection.
     *
     * @param subject - The subject or topic to which the message will be published.
     * @param payload - (Optional) The data or message payload to be sent. This will be encoded using the codec.
     * @param options - (Optional) Additional options for publishing, such as headers or delivery settings.
     *
     * @remarks
     * This method uses the `connection` object to publish the message. If the connection is not established,
     * the method will not perform any action. The `codec` is used to encode the payload before sending.
     *
     * @throws {Error} If encoding the payload fails or if the connection encounters an issue during publishing.
     *
     * @example
     * ```typescript
     * const agent = new Agent();
     * agent.publish('my.subject', { key: 'value' }, { headers: { 'custom-header': 'header-value' } });
     * ```
     */
    publish(payload, options) {
        var _a;
        console.log(`[Agent ${this.name} published]:`);
        console.log(JSON.stringify(payload));
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.publish(`${this.name}.client`, this.codec.encode(payload), options);
    }
    /**
     * Sends a notification to a specified subject with an optional payload and publishing options.
     *
     * @param subject - The subject or channel to which the notification will be sent.
     * @param payload - (Optional) The data to be sent along with the notification. This can be any serializable object.
     * @param options - (Optional) Additional options for publishing the notification, such as headers or delivery settings.
     *
     * @remarks
     * - The method logs the notification details to the console for debugging purposes.
     * - The payload is encoded using the codec before being published.
     * - If the connection is not established (`this.connection` is undefined), the notification will not be sent.
     *
     * @example
     * ```typescript
     * const agent = new Agent("exampleAgent");
     * const payload = { message: "Hello, World!" };
     * const options: PublishOptions = { headers: { priority: "high" } };
     *
     * agent.notify("example.subject", payload, options);
     * ```
     */
    notify(subject, payload, options) {
        var _a;
        console.log(`[Agent ${this.name} notify to ${subject}]:`);
        console.log(JSON.stringify(payload));
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.publish(`${subject}`, this.codec.encode(payload), options);
    }
    request(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const subjectToSendRequest = (_b = (_a = config.subject) !== null && _a !== void 0 ? _a : this.name) !== null && _b !== void 0 ? _b : '';
            console.log(`Agent ${this.name} requested to ${subjectToSendRequest}: ${JSON.stringify(config.payload)}.`);
            const msg = yield ((_c = this.connection) === null || _c === void 0 ? void 0 : _c.request(subjectToSendRequest, JSONCodec().encode(config.payload), {
                timeout: 3600 * 1000 // 1 hour 
            }));
            if (msg) {
                return JSONCodec().decode(msg.data);
            }
            return null;
        });
    }
    /**
     * Handles notifications with the provided payload.
     *
     * @param payload - The data associated with the notification.
     *                  This can be of any type and is expected to contain
     *                  the information necessary for processing the notification.
     *
     * @remarks
     * This method is intended to be overridden by subclasses to implement
     * specific notification handling logic. By default, it does not perform
     * any operations.
     *
     * @example
     * ```typescript
     * class CustomAgent extends Agent {
     *     public onNotify(payload: any) {
     *         console.log('Notification received:', payload);
     *     }
     * }
     *
     * const agent = new CustomAgent();
     * agent.onNotify({ message: 'Hello, world!' });
     * ```
     */
    onNotify(payload) { }
    /**
     * Establishes a connection to the NATS server.
     *
     * @param {Partial<{ servers: string | string[], token: string }>} config - Configuration object containing server details and token.
     * @returns {Promise<NatsConnection>}
     */
    connect(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const nc = yield connect({
                servers: config.servers,
                token: config.token
            });
            return nc;
        });
    }
}
