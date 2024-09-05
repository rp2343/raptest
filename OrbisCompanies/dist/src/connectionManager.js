"use strict";
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
exports.ConnectionManager = void 0;
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./auth");
const default_json_1 = __importDefault(require("../config/default.json"));
class ConnectionManager {
    constructor() {
        this.auth = new auth_1.Auth();
    }
    // Method to fetch data from the external API
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Use the getAuthorizationHeader method to decide whether to use API key or OAuth token
            const authorizationHeader = this.auth.getAuthorizationHeader();
            try {
                const response = yield axios_1.default.get(default_json_1.default.apiConfig.baseUrl, {
                    headers: {
                        Authorization: authorizationHeader,
                        "Content-Type": default_json_1.default.apiConfig.headers["Content-Type"]
                    },
                    params: {
                        query: JSON.stringify(default_json_1.default.apiConfig.query),
                    },
                    timeout: default_json_1.default.apiConfig.timeout,
                });
                return response.data;
            }
            catch (error) {
                console.error("Failed to fetch data:", error);
                throw new Error("Failed to fetch data");
            }
        });
    }
}
exports.ConnectionManager = ConnectionManager;
