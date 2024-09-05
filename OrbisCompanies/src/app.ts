import { ConnectionManager } from "./connectionManager";
import { ItemCreator } from "./itemCreator";
import { SchemaManager } from "./schemaManager";

export class App {
    private connectionManager: ConnectionManager;
    private itemCreator: ItemCreator;
    private schemaManager: SchemaManager;

    constructor() {
        this.connectionManager = new ConnectionManager();
        this.itemCreator = new ItemCreator();
        this.schemaManager = new SchemaManager();
    }

    // Method to initialize and set up the app
    public async initialize() {
        console.log("Setting up schema...");
        await this.schemaManager.createSchema();

        console.log("Fetching data...");
        const data = await this.connectionManager.fetchData();

        console.log("Ingesting data...");
        const result = await this.itemCreator.ingestData(data);

        console.log("Data ingested successfully:", result);
    }
}
