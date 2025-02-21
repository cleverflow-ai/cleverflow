import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { connect, NatsConnection, Subscription } from 'nats';
import AgentInfo from './AgentInfo.js';

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
export default abstract class Agent<In extends object, Out extends object> implements AgentInfo {
    public readonly name: string | undefined;
    public readonly description: string | undefined;

    protected connection: NatsConnection | null | undefined;
    protected subscription: Subscription | null | undefined;
    protected readonly codec = JSONCodec();
    
    /**
     * Constructs an Agent instance.
     * 
     * @param {Partial<{ name: string, description: string }>} config - Configuration object containing the agent's name and description.
     */
    constructor(config: Partial<{ name: string, description: string }>) {
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
    public async run(config: Partial<{ servers?: string | string[], token?: string, subject?: string }> = {}): Promise<void> {
        const defaultConfig = {
            servers: 'localhost:4222',
            token: '76de3ba222bec3af21f9dbfb01f3197b',
            subject: this.name
        };

        config = { ...defaultConfig, ...config };
        if (!this.connection) {
            this.connection = await this.connect(config);
            console.log(`Agent ${this.name} was connected.`);
        }
        
        if (!this.subscription) {
            if (config.subject) {
                this.subscription = this.connection.subscribe(config.subject);
                console.log(`Agent ${this.name} is now listening to ${config.subject}.`);
            } else {
                throw new Error('Subject is required to subscribe.');
            }

            if (this.subscription) { 
                for await (const message of this.subscription) {
                    const inPayload = this.codec.decode(message.data) as In;
                    console.log(`Agent ${this.name} received: ${JSON.stringify(inPayload)}.`);
            
                    const outPayload: Out = await this.process(inPayload);
                    const encodedOutPayload = this.codec.encode(outPayload);
                    message.respond(encodedOutPayload);
                    console.log(`Agent ${this.name} replied: ${JSON.stringify(outPayload)}.`);
                }
            }
        }
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
            console.log(`Agent ${this.name} was disconnected.`);
        }

        if (this.connection) {
            this.connection.close();
            this.connection = null;
            console.log(`Agent ${this.name} was drained and is not listening to any subject.`);
        }
    }

    /**
     * Abstract method to process incoming messages. Must be implemented by subclasses.
     * 
     * @abstract
     * @param {In} payload - The incoming message payload.
     * @returns {Promise<Out>}
     */
    public abstract process(payload: In): Promise<Out>;
    
    /**
     * Establishes a connection to the NATS server.
     * 
     * @param {Partial<{ servers: string | string[], token: string }>} config - Configuration object containing server details and token.
     * @returns {Promise<NatsConnection>}
     */
    protected async connect(config: Partial<{ servers: string | string[], token: string }>): Promise<NatsConnection> {
        const nc = await connect({
            servers: config.servers,
            token: config.token
        });

        return nc;
    }   
}