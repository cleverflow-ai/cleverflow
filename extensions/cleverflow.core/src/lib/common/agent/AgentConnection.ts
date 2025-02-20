import { JSONCodec } from 'nats/lib/nats-base-client/codec.js';
import { wsconnect, NatsConnection, Subscription, Msg, Payload, RequestOptions } from "@nats-io/nats-core";

/**
 * The Agent class is class for creating agents that connect to a NATS server
 * 
 * @abstract
 */
export default class AgentConnection {
    public readonly name: string | undefined;

    protected connection: NatsConnection | null | undefined;
    
    /**
     * Constructs an Agent instance.
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
     * @returns {Promise<NatsConnection>}
     */
    public async connect(config: Partial<{ servers: string | string[], token: string }>): Promise<NatsConnection> {
        this.connection = await wsconnect({
            servers: config.servers,
            token: config.token
        });
        console.log(`connected`);

        return this.connection;
    }

    /**
     * Stops the agent by draining the subscription and closing the connection.
     * 
     * @returns {Promise<void>}
     */
    public async stop(): Promise<void> {
        // if (this.subscription) {
        //     // Notes:
        //     // 1. `unsubscribe()` is immediate and does not guarantee processing of pending messages.
        //     // 2. `drain()` ensures all pending messages are processed before unsubscribing.
        //     // 3. For asynchronous subscriptions, you can also use the `max` option to automatically unsubscribe after receiving a specified number of messages.
        //     this.subscription.drain();
        //     this.subscription = null;
        //     console.log(`Agent ${this.name} was disconnected.`);
        // }

        if (this.connection) {
            this.connection.close();
            this.connection = null;
            console.log(`Agent ${this.name} was drained and is not listening to any subject.`);
        }
    }

    /**
     * Create a subscription to a subject.
     * @param config 
     * @returns 
     */
   
    public async subscribe(config: Partial<{ subject: string }>): Promise<Subscription> {
        if(!this.connection){
            throw new Error('Connection is required to subscribe.');
        }
        if (config.subject) {
            const subscription = this.connection.subscribe(config.subject);
            return subscription;
        } else {
            throw new Error('Subject is required to subscribe.');
        }
    }

    /**
     * Do a request reply to a subject.
     * @param config 
     * @returns 
     */
   
    public async sendRequest<T>(config: Partial<{ subject: string, payload: Payload, options: RequestOptions }>): Promise<T> {
        if(!this.connection){
            throw new Error('Connection is required to subscribe.');
        }
        if(!config.subject){
            throw new Error('Subject is required to request.');
        }

        const reply = await this.connection.request(
            config.subject, 
            config.payload, 
            config.options,
        );
        return JSONCodec<T>().decode(reply.data);
    }
}