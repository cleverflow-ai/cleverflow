import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { wsconnect } from "@nats-io/nats-core";
import type { NatsConnection, Subscription, Payload, RequestOptions, PublishOptions } from "@nats-io/nats-core";

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
     * The name of the agent.
     */
    public readonly name: string | undefined;

    /**
     * The NATS connection instance.
     */
    protected connection: NatsConnection | null | undefined;

    public readonly codec = JSONCodec();

    /**
     * Constructs an AgentConnection instance.
     * 
     * @param {Partial<{ name: string }>} config - Configuration object containing the agent's name.
     */
    constructor(config: Partial<{ name: string }>) {
        this.name = config.name;
    }

    /**
     * Establishes a connection to the NATS server.
     * 
     * @param {Partial<{ servers: string | string[], token: string }>} config - Configuration object containing server details and token.
     * @returns {Promise<NatsConnection>} - A promise that resolves to the NATS connection instance.
     */
    public async connect(config: Partial<{ servers: string | string[], token: string }>): Promise<NatsConnection> {
        this.connection = await wsconnect({
            servers: config.servers,
            token: config.token
        });

        return this.connection;
    }

    /**
     * Stops the agent by closing the connection.
     * 
     * @returns {Promise<void>} - A promise that resolves when the connection is closed.
     */
    public async stop(): Promise<void> {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
            console.log(`NatsConnection ${this.name} was drained and is not listening to any subject.`);
        }
    }

    /**
     * Creates a subscription to a subject.
     * 
     * @param {Partial<{ subject: string }>} config - Configuration object containing the subject to subscribe to.
     * @returns {Promise<Subscription>} - A promise that resolves to the subscription instance.
     * @throws {Error} - Throws an error if the connection or subject is not provided.
     */
    public async subscribe(config: Partial<{ subject: string }>): Promise<Subscription> {
        if (!this.connection) {
            throw new Error('[Subscribe failure] Connection is required to subscribe.');
        }
        if (config.subject) {
            return this.connection.subscribe(`${config.subject}.client`);
        } else {
            throw new Error('Subject is required to subscribe.');
        }
    }

    /**
     * Sends a request and waits for a reply from a subject.
     * 
     * @param {Partial<{ subject: string, payload: Payload, options: RequestOptions }>} config - Configuration object containing the subject, payload, and request options.
     * @returns {Promise<T>} - A promise that resolves to the decoded response data.
     * @throws {Error} - Throws an error if the connection or subject is not provided.
     */
    public async sendRequest<T>(config: Partial<{ subject: string, payload: Payload, options: RequestOptions }>): Promise<T> {
        if (!this.connection) {
            throw new Error('[SendRequest failure] Connection is required to subscribe.');
        }
        if (!config.subject) {
            throw new Error('Subject is required to request.');
        }

        const reply = await this.connection.request(
            `${config.subject}.server`,
            config.payload,
            config.options,
        );

        const payload = JSONCodec<T>().decode(reply.data);
        console.log(payload);

        console.log(`Agent ${config.subject} received: ${JSON.stringify(payload)}.`);

        return payload as T;
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
    public publish(config: {
        subject: string,
        payload: any,
        options?: PublishOptions
    }): void {

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