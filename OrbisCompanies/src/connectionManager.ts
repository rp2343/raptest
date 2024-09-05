import axios from "axios";
import { Auth } from "./auth";
import config from "../config/default.json";

export class ConnectionManager {
    private auth: Auth;

    constructor() {
        this.auth = new Auth();
    }

    // Method to fetch data from the external API
    public async fetchData(): Promise<any> {
        // Use the getAuthorizationHeader method to decide whether to use API key or OAuth token
        const authorizationHeader = this.auth.getAuthorizationHeader();

        try {
            const response = await axios.get(config.apiConfig.baseUrl, {
                headers: {
                    Authorization: authorizationHeader,
                    "Content-Type": config.apiConfig.headers["Content-Type"]
                },
                params: {
                    query: JSON.stringify(config.apiConfig.query),
                },
                timeout: config.apiConfig.timeout,
            });

            return response.data;
        } catch (error) {
            console.error("Failed to fetch data:", error);
            throw new Error("Failed to fetch data");
        }
    }
}
