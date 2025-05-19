
import { GUIAgent } from '@cleverflow/cleverflow.core';
import type { GUIAgentInPayload, GUIAgentOutPayload } from '@cleverflow/cleverflow.core';

export class CFGUIAgent extends GUIAgent {

    public async getGUI(payload: GUIAgentInPayload): Promise<GUIAgentOutPayload> {

        switch (`${payload.id}`.toLowerCase()) {
            case 'get_file':
                return {
                    jsonForm: {
                        "type": "object",
                        "properties": {
                            "fileUrl": {
                                "type": "string",
                                "format": "uri",
                                "title": "File URL"
                            }
                        },
                        "required": ["fileUrl"]
                    }
                };
            default:
                return {
                    jsonForm: {}
                };
        }
    }
}
