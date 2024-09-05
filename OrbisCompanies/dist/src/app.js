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
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const connectionManager_1 = require("./connectionManager");
const itemCreator_1 = require("./itemCreator");
const schemaManager_1 = require("./schemaManager");
class App {
    constructor() {
        this.connectionManager = new connectionManager_1.ConnectionManager();
        this.itemCreator = new itemCreator_1.ItemCreator();
        this.schemaManager = new schemaManager_1.SchemaManager();
    }
    // Method to initialize and set up the app
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Setting up schema...");
            yield this.schemaManager.createSchema();
            console.log("Fetching data...");
            const data = yield this.connectionManager.fetchData();
            console.log("Ingesting data...");
            const result = yield this.itemCreator.ingestData(data);
            console.log("Data ingested successfully:", result);
        });
    }
}
exports.App = App;
