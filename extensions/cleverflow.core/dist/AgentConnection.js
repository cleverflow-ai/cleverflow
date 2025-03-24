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
import { wsconnect } from "@nats-io/nats-core";
/**
 * The Agent class is class for creating agents that connect to a NATS server
 *
 * @abstract
 */
/**
 * Represents a connection to the NATS server for an agent.
 */
export class AgentConnection {
    /**
     * Constructs an AgentConnection instance.
     *
     * @param {Partial<{ name: string }>} config - Configuration object containing the agent's name.
     */
    constructor(config) {
        this.codec = JSONCodec();
        this.name = config.name;
    }
    /**
     * Establishes a connection to the NATS server.
     *
     * @param {Partial<{ servers: string | string[], token: string }>} config - Configuration object containing server details and token.
     * @returns {Promise<NatsConnection>} - A promise that resolves to the NATS connection instance.
     */
    connect(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield wsconnect({
                servers: config.servers,
                token: config.token
            });
            return this.connection;
        });
    }
    /**
     * Stops the agent by closing the connection.
     *
     * @returns {Promise<void>} - A promise that resolves when the connection is closed.
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                this.connection.close();
                this.connection = null;
                console.log(`NatsConnection ${this.name} was drained and is not listening to any subject.`);
            }
        });
    }
    /**
     * Creates a subscription to a subject.
     *
     * @param {Partial<{ subject: string }>} config - Configuration object containing the subject to subscribe to.
     * @returns {Promise<Subscription>} - A promise that resolves to the subscription instance.
     * @throws {Error} - Throws an error if the connection or subject is not provided.
     */
    subscribe(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                throw new Error('[Subscribe failure] Connection is required to subscribe.');
            }
            if (config.subject) {
                return this.connection.subscribe(`${config.subject}.client`);
            }
            else {
                throw new Error('Subject is required to subscribe.');
            }
        });
    }
    /**
     * Sends a request and waits for a reply from a subject.
     *
     * @param {Partial<{ subject: string, payload: Payload, options: RequestOptions }>} config - Configuration object containing the subject, payload, and request options.
     * @returns {Promise<T>} - A promise that resolves to the decoded response data.
     * @throws {Error} - Throws an error if the connection or subject is not provided.
     */
    sendRequest(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                throw new Error('[SendRequest failure] Connection is required to subscribe.');
            }
            if (!config.subject) {
                throw new Error('Subject is required to request.');
            }
            const reply = yield this.connection.request(`${config.subject}.server`, config.payload, config.options);
            const payload = JSONCodec().decode(reply.data);
            console.log(payload);
            console.log(`Agent ${config.subject} received: ${JSON.stringify(payload)}.`);
            return payload;
        });
    }
    /**
     * Publishes a message to a specified subject using the established connection.
     *
     * @param config - Configuration object for the publish operation.
     * @param config.subject - The subject to which the message will be published. This is required.
     * @param config.payload - The payload of the message to be published. This can be any data type.
     * @param config.options - Optional publishing options, such as headers or other metadata.
     *
     * @throws {Error} If the connection is not established before publishing.
     * @throws {Error} If the subject is not provided in the configuration.
     *
     * @remarks
     * - The method logs the subject and payload to the console before publishing.
     * - The payload is encoded using the codec before being sent.
     * - The message is published to a subject with the suffix `.server`.
     *
     * @example
     * ```typescript
     * agentConnection.publish({
     *     subject: 'example.subject',
     *     payload: { key: 'value' },
     *     options: { headers: { 'custom-header': 'header-value' } }
     * });
     * ```
     */
    publish(config) {
        if (!this.connection) {
            throw new Error('[SendRequest failure] Connection is required to subscribe.');
        }
        if (!config.subject) {
            throw new Error('Subject is required to request.');
        }
        console.log(`[Agent ${config.subject} published]:`);
        console.log(JSON.stringify(config.payload));
        this.connection.publish(`${config.subject}.server`, this.codec.encode(config.payload), config.options);
    }
}
