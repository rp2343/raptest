"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class Auth {
    constructor() {
        this.token = null;
    }
    // Method to get the access token or API key
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield axios_1.default.post(process.env.AUTH_URL, {
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
            }
            catch (error) {
                console.error("Failed to fetch access token:", error);
                throw new Error("Failed to fetch access token");
            }
        });
    }
    // Method to refresh the token (if needed)
    refreshAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.token = null; // Clear the old token
            return this.getAccessToken(); // Fetch a new one
        });
    }
    // Get authorization header (API key or OAuth token)
    getAuthorizationHeader() {
        return process.env.API_KEY
            ? `Bearer ${process.env.API_KEY}`
            : `Bearer ${this.token}`;
    }
}
exports.Auth = Auth;
