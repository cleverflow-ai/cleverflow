/**
 * Interface representing the information of an agent.
 * 
 * @interface AgentInfo
 * 
 * @property {string | undefined} name - The name of the agent. It can be a string or undefined if the name is not set.
 * @property {string | undefined} description - A brief description of the agent. It can be a string or undefined if the description is not set.
 */
export interface AgentInfo {
    name: string | undefined;
    description: string | undefined;
    isExternal?: boolean | undefined,
    isPrivate?: boolean | undefined,
    actions?: string[] | undefined,
    guiEnabled?: boolean | undefined,
    onNotify?: (payload: any) => void
}