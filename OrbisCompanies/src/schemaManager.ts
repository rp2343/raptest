import axios from "axios";
import { Auth } from "./auth";
import config from "../config/default.json";

export class SchemaManager {
    private auth: Auth;

    constructor() {
        this.auth = new Auth();
    }

    // Method to create or update the schema
    public async createSchema(): Promise<any> {
        // Get the authorization header from the Auth class
        const authorizationHeader = this.auth.getAuthorizationHeader();

        // Define the schema using the structure from the configuration file
        const schema = {
            baseType: "microsoft.graph.externalItem",
            properties: [
                { name: "name", type: "String" },
                { name: "status", type: "String" },
                { name: "operation", type: "String" },
                { name: "employeeCount", type: "Int32" },
                { name: "orbisId", type: "String" },
                { name: "bvdId", type: "String" }
            ]
        };

        try {
            const response = await axios.put(
                `${config.graphConfig.graphApiUrl}/external/connections/${config.graphConfig.connectionId}/schema`,
                schema,
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
            console.error("Failed to create schema:", error);
            throw new Error("Failed to create schema");
        }
    }
}
