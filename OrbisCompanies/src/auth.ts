import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export class Auth {
    private token: string | null = null;

    // Method to get the access token or API key
    public async getAccessToken(): Promise<string> {
        // If API key is being used, return the API key directly
        if (process.env.API_KEY) {
            return process.env.API_KEY;
        }

        // If token already exists, return it
        if (this.token) {
            return this.token;
        }

        try {
            // Otherwise, fetch the token via OAuth
            const response = await axios.post(process.env.AUTH_URL as string, {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                scope: process.env.SCOPE,
                grant_type: "client_credentials",
            });

            this.token = response.data.access_token;

            // Ensure the token is a string before returning it
            if (!this.token) {
                throw new Error("Failed to fetch access token: Token is null or undefined");
            }

            return this.token;
        } catch (error) {
            console.error("Failed to fetch access token:", error);
            throw new Error("Failed to fetch access token");
        }
    }

    // Method to refresh the token (if needed)
    public async refreshAccessToken(): Promise<string> {
        this.token = null; // Clear the old token
        return this.getAccessToken(); // Fetch a new one
    }

    // Get authorization header (API key or OAuth token)
    public getAuthorizationHeader(): string {
        return process.env.API_KEY
            ? `Bearer ${process.env.API_KEY}`
            : `Bearer ${this.token}`;
    }
}
