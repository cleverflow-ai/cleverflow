import type { Subscription } from "@nats-io/nats-core";
import AgentConnection from './AgentConnection.js';
import { JSONCodec } from "nats";

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
export default abstract class AgentMessenger<In extends object, Out extends object> {
    public subject: string | undefined;

    protected connection: AgentConnection | null | undefined;
    protected subscription: Subscription | null | undefined;

    /**
     * Constructs an Agent instance.
     * 
     * @param {Partial<{ subject: string }>} config - Configuration object containing the agent's subject.
     */
    constructor(config: Partial<{ connection: AgentConnection, subject: string }>) {
        this.connection = config.connection;
        this.subject = config.subject;
    }

    /**
     * Stops the agent by draining the subscription and closing the connection.
     * 
     * @returns {Promise<void>}
     */
    public async stop(): Promise<void> {
        if (this.subscription) {
            // Notes:
            // 1. `unsubscribe()` is immediate and does not guarantee processing of pending messages.
            // 2. `drain()` ensures all pending messages are processed before unsubscribing.
            // 3. For asynchronous subscriptions, you can also use the `max` option to automatically unsubscribe after receiving a specified number of messages.
            this.subscription.drain();
            this.subscription = null;
            console.log(`Agent ${this.subject} was disconnected.`);
        }
    }

    /**
     * Subscribes to a subject to start processing messages.
     * 
     * @param {Partial<{ servers: string | string[], token: string, subject: string }>} config - Configuration object containing server details, token, and subject.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the subject is not provided.
     */
    public async start(): Promise<void> {
        if (!this.connection) {
            throw new Error('Connection is not established');
        }

        await this.stop();

        if (this.subject) {
            this.subscription = await this.connection.subscribe({ subject: this.subject });
            console.log(`Agent is now listening to ${this.subject}.`);
        } else {
            throw new Error('Subject is required to subscribe.');
        }

        if (this.subscription) {
            this.subscription.callback = (err, message) => {
                const inPayload = this.connection?.codec.decode(message.data);
                console.log(`Agent ${this.subject} received: ${JSON.stringify(inPayload)}.`);
                this.process(inPayload as In);
            };
        }
    }

    /**
     * Abstract method to process incoming messages. Must be implemented by subclasses.
     * 
     * @abstract
     * @param {In} payload - The incoming message payload.
     * @returns {Promise<Out>}
     */
    protected abstract process(payload: In): Promise<Out>;

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
    public async request(payload: In): Promise<Out> {
        if (this.connection) {
            console.log(`Agent ${this.subject} requested: ${JSON.stringify(payload)}.`);
            return await this.connection.sendRequest<Out>({
                subject: this.subject,
                payload: this.connection.codec.encode(payload),
                options: {
                    timeout: 3600 * 1000 // 1 hour 
                },
            });
        } else {
            throw new Error('Connection is not established');
        }
    }

    /**
     * Publishes a message to the specified subject using the established connection.
     *
     * @param payload - The message payload to be published. It is encoded using the connection's codec.
     * @throws {Error} Throws an error if the connection is not established.
     */
    public publish(payload: In): void {
        if (this.connection) {
            this.connection.publish({
                subject: this.subject ?? '',
                payload: payload,
            });
        } else {
            throw new Error('Connection is not established');
        }
    }
}