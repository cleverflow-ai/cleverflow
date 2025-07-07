import { TaskContext } from "@cleverflow-ai/cleverflow.agents/server";
import _ from "lodash";

export const extractClientSession = (context: TaskContext) => {
    let clientSession: any = context.userMessage.metadata?.session;
    if (clientSession) {
        return clientSession;
    }
    const userMessage: any = _.find(context.history, (userMessage) => {
        return userMessage.metadata?.session;
    });
    return userMessage?.metadata?.session;
}