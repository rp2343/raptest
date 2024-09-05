import axios from "axios";
import { Auth } from "./auth";
import config from "../config/default.json";

export class ItemCreator {
    private auth: Auth;

    constructor() {
        this.auth = new Auth();
    }

    // Method to ingest data into Microsoft Graph
    public async ingestData(data: any): Promise<any> {
        // Get the authorization header from the Auth class
        const authorizationHeader = this.auth.getAuthorizationHeader();

        // Map the incoming data to the format expected by Microsoft Graph
        const items = data.map((item: any) => ({
            id: item.BvDId,
            properties: {
                name: item.NAME,
                status: item.STATUS,
                operation: item.OPRE,
                employeeCount: item.EMPL,
                orbisId: item.ORBISID,
                bvdId: item.BvDId
            }
        }));

        try {
            const response = await axios.post(
                `${config.graphConfig.graphApiUrl}/external/connections/${config.graphConfig.connectionId}/items`,
                { value: items },
                {
                    headers: {
                        Authorization: authorizationHeader,
                        "Content-Type": "application/json"
                    },
                    timeout: config.apiConfig.timeout,
                }
            );

            return response.data;
        } catch (error) {
            console.error("Failed to ingest data:", error);
            throw new Error("Failed to ingest data");
        }
    }
}
