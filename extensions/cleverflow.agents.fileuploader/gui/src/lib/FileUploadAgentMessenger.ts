import { AgentConnection, AgentMessenger } from "@cleverflow/cleverflow.core";

export type InPayload = {
    action: 'upload',
    name: string,
    data: any,
}

export type OutPayload = {
    data: string,
}

/**
 * @class BFlowRunnerAgentMessenger
 * @extends AgentMessenger<InPayload, OutPayload>
 * @classdesc The BFlowRunnerAgentMessenger class is responsible for sending requests to the BFlow service to convert BFlow data to BFlowViz format.
 * 
 * @template InPayload - The type of the input payload containing the BFlow data to be processed.
 * @template OutPayload - The type of the output payload containing the BFlowViz data.
 */
export default class FileUploadAgentMessenger extends AgentMessenger<InPayload, OutPayload> {

    /**
     * Initializes a new instance of the BFlowRunnerAgentMessenger class.
     * Sets the agent subject to 'bflow-to-bflowviz'.
     * 
     * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
     */
    constructor(config: Partial<{ connection: AgentConnection }>) {
        super({ connection: config.connection, subject: 'file-uploader' });
    }

    async upload(fileToUpload: any) {
        return await this?.request({
            action: 'upload',
            name: fileToUpload.name,
            data: fileToUpload.data,
        });
    }
}