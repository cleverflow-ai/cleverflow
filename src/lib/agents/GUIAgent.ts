
import { GUIAgent } from '@cleverflow/cleverflow.core';
import type { GUIAgentInPayload, GUIAgentOutPayload } from '@cleverflow/cleverflow.core';

export class CFGUIAgent extends GUIAgent {

    public async getGUI(payload: GUIAgentInPayload): Promise<GUIAgentOutPayload> {

        switch (`${payload.id}`.toLowerCase()) {
            case 'file-id-form':
                return {
                    jsonForm: {
                        "type": "object",
                        "properties": {
                            "fileId": {
                                "type": "string",
                                "format": "string",
                                "title": "File ID"
                            }
                        },
                        "required": ["fileId"]
                    }
                };
            default:
                return {
                    jsonForm: {}
                };
        }
    }
}
