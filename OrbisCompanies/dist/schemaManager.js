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
exports.SchemaManager = void 0;
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./auth");
const default_json_1 = __importDefault(require("../config/default.json"));
class SchemaManager {
    constructor() {
        this.auth = new auth_1.Auth();
    }
    // Method to create or update the schema
    createSchema() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield axios_1.default.put(`${default_json_1.default.graphConfig.graphApiUrl}/external/connections/${default_json_1.default.graphConfig.connectionId}/schema`, schema, {
                    headers: {
                        Authorization: authorizationHeader,
                        "Content-Type": "application/json"
                    },
                    timeout: default_json_1.default.apiConfig.timeout,
                });
                return response.data;
            }
            catch (error) {
                console.error("Failed to create schema:", error);
                throw new Error("Failed to create schema");
            }
        });
    }
}
exports.SchemaManager = SchemaManager;
