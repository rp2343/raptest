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
exports.ItemCreator = void 0;
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./auth");
const default_json_1 = __importDefault(require("../config/default.json"));
class ItemCreator {
    constructor() {
        this.auth = new auth_1.Auth();
    }
    // Method to ingest data into Microsoft Graph
    ingestData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the authorization header from the Auth class
            const authorizationHeader = this.auth.getAuthorizationHeader();
            // Map the incoming data to the format expected by Microsoft Graph
            const items = data.map((item) => ({
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
                const response = yield axios_1.default.post(`${default_json_1.default.graphConfig.graphApiUrl}/external/connections/${default_json_1.default.graphConfig.connectionId}/items`, { value: items }, {
                    headers: {
                        Authorization: authorizationHeader,
                        "Content-Type": "application/json"
                    },
                    timeout: default_json_1.default.apiConfig.timeout,
                });
                return response.data;
            }
            catch (error) {
                console.error("Failed to ingest data:", error);
                throw new Error("Failed to ingest data");
            }
        });
    }
}
exports.ItemCreator = ItemCreator;
