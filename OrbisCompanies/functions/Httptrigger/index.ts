import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ConnectionManager } from "../../src/connectionManager";
import { ItemCreator } from "../../src/itemCreator";
import { SchemaManager } from "../../src/schemaManager";
import config from "../../config/default.json";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const connectionManager = new ConnectionManager();
    const itemCreator = new ItemCreator();
    const schemaManager = new SchemaManager();

    const action = req.query.action || (req.body && req.body.action);

    try {
        switch (action) {
            case 'enable':
                context.log('Enabling connector...');
                await enableConnector(context, req);
                break;

            case 'disable':
                context.log('Disabling connector...');
                await disableConnector(context, req);
                break;

            case 'ingestItems':
                context.log('Ingesting items into Microsoft Graph...');
                await ingestItems(context, req, connectionManager, itemCreator);
                break;

            case 'setupSchema':
                context.log('Setting up schema...');
                await setupSchema(context, req, schemaManager);
                break;

            default:
                context.res = {
                    status: 400,
                    body: "Please pass a valid action on the query string or in the request body."
                };
                break;
        }
    } catch (error) {
        context.log.error("An error occurred: ", error);
        context.res = {
            status: 500,
            body: `An error occurred: ${error.message}`
        };
    }
};

async function enableConnector(context: Context, req: HttpRequest) {
    // Your logic to handle connector enabling (e.g., initial data sync)
    context.res = {
        status: 200,
        body: "Connector enabled successfully."
    };
}

async function disableConnector(context: Context, req: HttpRequest) {
    // Your logic to handle connector disabling (e.g., cleanup tasks)
    context.res = {
        status: 200,
        body: "Connector disabled successfully."
    };
}

async function ingestItems(context: Context, req: HttpRequest, connectionManager: ConnectionManager, itemCreator: ItemCreator) {
    const data = await connectionManager.fetchData();
    const result = await itemCreator.ingestData(data);
    context.res = {
        status: 200,
        body: `Items ingested successfully: ${result}`
    };
}

async function setupSchema(context: Context, req: HttpRequest, schemaManager: SchemaManager) {
    const schema = await schemaManager.createSchema();
    context.res = {
        status: 200,
        body: `Schema setup successfully: ${schema}`
    };
}

export default httpTrigger;
