// import { b } from '../baml_client/async_client.js';
// import Clients from '../baml/Clients.js';
// import { TaskContext, TaskYieldUpdate } from '@cleverflow-ai/cleverflow.agents/server';
// import * as schema from '@cleverflow-ai/cleverflow.agents/schema';
// import _ from 'lodash';
// import { BFlowNode, BFlowNodeState, BFlowNodeType } from '../baml_client/types.js';

// const runNode = async (node: BFlowNode, config: {
//     onProgress: () => Promise<void>,
// }): Promise<BFlowNodeState> => {

//     if (node.state === BFlowNodeState.SUCCESS) {
//         return node.state;
//     }

//     if (node.type === BFlowNodeType.ENTRY) {

//         for (const child of node.goto!) {
//             const status = await runNode(child, config);
//             if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
//                 return BFlowNodeState.WAITING_FOR_CLIENT;
//             }
//         }

//     } else if (node.type === BFlowNodeType.FALLBACK) {

//         for (const child of node.goto!) {
//             const status = await runNode(child, config);
//             if (status === BFlowNodeState.SUCCESS) {
//                 node.state = BFlowNodeState.SUCCESS;
//                 await config.onProgress();
//                 return node.state;
//             } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
//                 return BFlowNodeState.WAITING_FOR_CLIENT;
//             }
//         }

//         node.state = BFlowNodeState.FAILURE;
//         await config.onProgress();
//         return node.state;

//     } else if (node.type === BFlowNodeType.SEQUENCE) {

//         for (const child of node.goto!) {
//             const status = await runNode(child, config);
//             if (status === BFlowNodeState.FAILURE) {
//                 node.state = BFlowNodeState.FAILURE;
//                 await config.onProgress();
//                 return node.state;
//             } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
//                 return BFlowNodeState.WAITING_FOR_CLIENT;
//             }
//         }

//         node.state = BFlowNodeState.SUCCESS;
//         await config.onProgress();
//         return node.state;

//     } else if (node.type === BFlowNodeType.ACTION || node.type === BFlowNodeType.CONDITION) {

//         const candidateAgent = await this.getAgent(node);
//         if (candidateAgent && candidateAgent.guiEnabled) {
//             if (this.hasNodeResult(node)) {
//                 node.state = BFlowNodeState.SUCCESS;
//             } else {
//                 const guiData = await this.loadAgentGUI(candidateAgent);
//                 if (guiData) {
//                     this.publish({
//                         guiEnabled: true,
//                         guiData: guiData
//                     }, {});
//                 }
//                 node.state = BFlowNodeState.WAITING_FOR_CLIENT;
//                 this.savePoint(node);
//             }
//             return node.state;
//         }

//         if (this.connection && node.agent) {
//             let inputs: any[] = [];

//             if (node.inputs) {
//                 // Each Input corresponds a Node Id
//                 for (const nodeId of node.inputs) {
//                     // Get saved Output of required Node
//                     const out = this._outs.get(nodeId);
//                     const outResult = out?.result;
//                     if (outResult) {
//                         inputs.push(outResult);
//                     }
//                 }
//             }

//             node.state = BFlowNodeState.RUNNING;
//             await config.onProgress();

//             const reply = await this.connection.request(
//                 `${node.agent.name}.server`,
//                 this.codec.encode({
//                     description: node.description,
//                     config: node.config,
//                     inputs: inputs,
//                 }),
//                 {
//                     timeout: 1000 * 3600
//                 });
//             const result = this.codec.decode(reply.data);
//             if (node.id) {
//                 this._outs.set(node.id, result);
//                 node.state = BFlowNodeState.SUCCESS;
//                 await config.onProgress();
//                 return node.state;
//             }
//         }

//         return BFlowNodeState.FAILURE;
//     }

//     return BFlowNodeState.FAILURE;
// }


// export async function* runBFlow(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
//     let _outs = new Map<string, any>();

//     yield {
//         state: 'working',
//         message: {
//             role: 'agent',
//             parts: [{ type: 'text', text: 'Working on it...' }]
//         }
//     };

//     const input = context.task.metadata?.input as any;
//     const bflow = input?.bflow;

//     await this.runNode(bflow.root, {
//         onProgress: async () => {
//                 yield {
//                 state: 'working',
//                     message: {
//                     role: 'agent',
//                         parts: [{
//                             type: 'data', data: {
//                                 bflow: bflow,
//                                 outs: Object.fromEntries(_outs)
//                             }]
//                 }
//             };
//         },
//     });

//     yield {
//         state: 'completed',
//         message: {
//             role: 'agent',
//             parts: [{
//                 type: 'data',
//                 data: {
//                     bflow: bflow,
//                     outs: Object.fromEntries(this._outs)
//                 }
//             }]
//         }
//     };


// }