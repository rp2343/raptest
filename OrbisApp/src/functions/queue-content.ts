import { InvocationContext, app } from "@azure/functions";
import { ContentMessage, CrawlType, ItemAction } from "../common/ContentMessage";
import { config } from "../common/config";
import { client } from "../common/graphClient";
import { enqueueItemDeletion, enqueueItemUpdate } from "../common/queueClient";
import { addItemToTable, getItemIds, getLastModified, recordLastModified, removeItemFromTable } from "../common/tableClient";

const { notificationEndpoint: apiUrl } = config;

async function crawl(crawlType: CrawlType, context: InvocationContext) {
    switch (crawlType) {
        case 'full':
        case 'incremental':
            await crawlFullOrIncremental(crawlType, context);
            break;
        case 'removeDeleted':
            await removeDeleted(context);
            break;
    }
}

async function crawlFullOrIncremental(crawlType: CrawlType, context: InvocationContext) {
    let url = `${apiUrl}/api/products`;

    if (crawlType === 'incremental') {
        const lastModified = await getLastModified(context);
        url += `?$filter=last_modified_t gt ${lastModified}`;
    }

    context.log(`Retrieving items from ${url}...`);

    const res = await fetch(url);
    if (!res.ok) {
        context.log(`Error retrieving item from ${url}: ${res.statusText}`);
        return;
    }

    const products: Product[] = await res.json();
    context.log(`Retrieved ${products.length} items from ${url}`);

    for (const product of products) {
        context.log(`Enqueuing item update for ${product.id}...`);
        enqueueItemUpdate(product.id);
    }
}

async function removeDeleted(context: InvocationContext) {
    const url = `${apiUrl}/api/products`;

    context.log(`Retrieving items from ${url}...`);

    const res = await fetch(url);
    if (!res.ok) {
        context.log(`Error retrieving item from ${url}: ${res.statusText}`);
        return;
    }

    const products: Product[] = await res.json();
    context.log(`Retrieved ${products.length} items from ${url}`);

    context.log('Retrieving ingested items...');
    const ingestedItemIds = await getItemIds(context);

    ingestedItemIds.forEach(ingestedItemId => {
        if (products.find(product => product.id === ingestedItemId)) {
            context.log(`Item ${ingestedItemId} still exists, skipping...`);
        }
        else {
            context.log(`Item ${ingestedItemId} no longer exists, deleting...`);
            enqueueItemDeletion(ingestedItemId);
        }
    });
}

async function processItem(itemId: string, itemAction: ItemAction, context: InvocationContext) {
    switch (itemAction) {
        case 'update':
            await updateItem(itemId, context);
            break;
        case 'delete':
            await deleteItem(itemId, context);
            break;
    }
}

async function updateItem(itemId: string, context: InvocationContext) {
    const url = `${apiUrl}/api/products/${itemId}`;

    context.log(`Retrieving item from ${url}...`);

    const res = await fetch(url);
    if (!res.ok) {
        context.log(`Error retrieving item from ${url}: ${res.statusText}`);
        return;
    }

    const product: Product = await res.json();
    context.log(`Retrieved product from ${url}`);
    context.log(JSON.stringify(product, null, 2));

    const externalItem = {
        id: product.id,
        properties: {
            NAME: product.NAME,
            STATUS: product.STATUS,
            EMPL: product.EMPL,
            OPRE: product.OPRE,
            ORBISID: product.ORBISID,
        },
        content: {
            value: product.NAME,
            type: 'text'
        },
        acl: [
            {
                accessType: 'grant',
                type: 'everyone',
                value: 'everyone'
            }
        ]
    }

    context.log(`Transformed item`);
    context.log(JSON.stringify(externalItem, null, 2));

    const externalItemUrl = `/external/connections/${config.connector.id}/items/${product.id}`;
    context.log(`Updating external item ${externalItemUrl}...`)

    await client
        .api(externalItemUrl)
        .header('content-type', 'application/json')
        .put(externalItem);

    context.log(`Adding item ${product.id} to table storage...`);
    // track item to support deletion
    await addItemToTable(product.id, context);
    context.log(`Tracking last modified date ${product.last_modified_t}`);
    // track last modified date for incremental crawl
    await recordLastModified(product.last_modified_t, context);
}

async function deleteItem(itemId: string, context: InvocationContext) {
    const externalItemUrl = `/external/connections/${config.connector.id}/items/${itemId}`;
    context.log(`Deleting external item ${externalItemUrl}...`)

    await client
        .api(externalItemUrl)
        .delete();

    context.log(`Removing item ${itemId} from table storage...`);
    await removeItemFromTable(itemId, context);
}

app.storageQueue("contentQueue", {
    connection: "AzureWebJobsStorage",
    queueName: "queue-content",
    handler: async (message: ContentMessage, context: InvocationContext) => {
        context.log('Received message from queue queue-content');
        context.log(JSON.stringify(message, null, 2));

        const { action, crawlType, itemAction, itemId } = message;

        switch (action) {
            case 'crawl':
                await crawl(crawlType, context);
                break;
            case 'item':
                await processItem(itemId, itemAction, context);
                break;
            default:
                break;
        }
    }
});

// import { InvocationContext, app } from "@azure/functions";
// import { ContentMessage, CrawlType, ItemAction } from "../common/ContentMessage";
// import { config } from "../common/config";
// import { client } from "../common/graphClient";
// import {
//   addItemToTable,
//   getItemIds,
//   getLastModified,
//   recordLastModified,
//   removeItemFromTable,
// } from "../common/tableClient";

// const { API_BASE_URL, API_KEY } = process.env; // Ensure these are set in your environment variables

// async function crawl(crawlType: CrawlType, context: InvocationContext) {
//   switch (crawlType) {
//     case "full":
//     case "incremental":
//       await crawlFullOrIncremental(crawlType, context);
//       break;
//     case "removeDeleted":
//       await removeDeleted(context);
//       break;
//   }
// }

// async function crawlFullOrIncremental(
//   crawlType: CrawlType,
//   context: InvocationContext
// ) {
//   let url = `${API_BASE_URL}`;

//   if (crawlType === "incremental") {
//     const lastModified = await getLastModified(context);
//     context.log(`Performing incremental crawl since ${lastModified}`);
//     // Adjust the API query or parameters for incremental crawl if needed
//   }

//   context.log(`Retrieving items from ${url}...`);

//   const requestBody = {
//     WHERE: [{ Status: "Active" }],
//     SELECT: ["NAME", "STATUS", "OPRE", "EMPL", "ORBISID", "BvDId"],
//     RANGE: { MAX: 1000, OFFSET: 0 },
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(requestBody),
//   });

//   if (!res.ok) {
//     context.log(`Error retrieving items from ${url}: ${res.statusText}`);
//     return;
//   }

//   const products: Product[] = await res.json();
//   context.log(`Retrieved ${products.length} items from ${url}`);

//   for (const product of products) {
//     const itemId = product.ORBISID; // Use ORBISID as the item ID
//     context.log(`Using ORBISID as item ID: ${itemId}`);

//     // Create the external item to push to Microsoft Graph
//     const externalItem = {
//       id: itemId,
//       properties: {
//         NAME: product.NAME,
//         STATUS: product.STATUS,
//         BvDId: product.BvDId,
//         EMPL: product.EMPL,
//         OPRE: product.OPRE,
//         ORBISID: product.ORBISID,
//       },
//       acl: [
//         {
//           accessType: "grant",
//           type: "everyone",
//           value: "everyone",
//         },
//       ],
//     };

//     // Push the external item to Microsoft Graph
//     try {
//       const externalItemUrl = `/external/connections/${config.connector.id}/items/${itemId}`;
//       await client
//         .api(externalItemUrl)
//         .header("Content-Type", "application/json")
//         .put(externalItem);

//       context.log(`Pushed item with ID: ${itemId} to Microsoft Graph`);

//       // Track the item in table storage
//       await addItemToTable(itemId, context);

//       // Track the last modified date for incremental crawl
//       await recordLastModified(product.last_modified_t, context);
//     } catch (error) {
//       context.log(
//         `Error pushing item ${itemId} to Microsoft Graph: ${error.message}`
//       );
//     }
//   }
// }

// async function removeDeleted(context: InvocationContext) {
//   const url = `${API_BASE_URL}`;

//   context.log(`Retrieving items from ${url} for deletion check...`);

//   const requestBody = {
//     WHERE: [{ Status: "Active" }],
//     SELECT: ["ORBISID"],
//     RANGE: { MAX: 1000, OFFSET: 0 },
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(requestBody),
//   });

//   if (!res.ok) {
//     context.log(`Error retrieving items from ${url}: ${res.statusText}`);
//     return;
//   }

//   const products: Product[] = await res.json();
//   context.log(`Retrieved ${products.length} items from ${url}`);

//   const currentProductIds = products.map((product) => product.ORBISID);
//   const ingestedItemIds = await getItemIds(context);

//   for (const ingestedItemId of ingestedItemIds) {
//     if (currentProductIds.includes(ingestedItemId)) {
//       context.log(`Item ${ingestedItemId} still exists, skipping deletion...`);
//     } else {
//       context.log(
//         `Item ${ingestedItemId} no longer exists, deleting from Graph...`
//       );
//       await deleteItem(ingestedItemId, context);
//     }
//   }
// }

// async function processItem(
//   itemId: string,
//   itemAction: ItemAction,
//   context: InvocationContext
// ) {
//   switch (itemAction) {
//     case "update":
//       await updateItem(itemId, context);
//       break;
//     case "delete":
//       await deleteItem(itemId, context);
//       break;
//   }
// }

// async function updateItem(itemId: string, context: InvocationContext) {
//   const url = `${API_BASE_URL}`;

//   context.log(`Retrieving item with ID: ${itemId} from ${url}...`);

//   const requestBody = {
//     WHERE: [{ ORBISID: itemId }],
//     SELECT: ["NAME", "STATUS", "OPRE", "EMPL", "ORBISID", "BvDId"],
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(requestBody),
//   });

//   if (!res.ok) {
//     context.log(`Error retrieving item from ${url}: ${res.statusText}`);
//     return;
//   }

//   const products: Product[] = await res.json();
//   const product = products[0]; // Assuming the query returns a single product

//   if (!product) {
//     context.log(`Product with ID ${itemId} not found.`);
//     return;
//   }

//   context.log(`Retrieved product from ${url}`);
//   context.log(JSON.stringify(product, null, 2));

//   const externalItem = {
//     id: product.ORBISID,
//     properties: {
//       NAME: product.NAME,
//       STATUS: product.STATUS,
//       BvDId: product.BvDId,
//       EMPL: product.EMPL,
//       OPRE: product.OPRE,
//       ORBISID: product.ORBISID,
//     },
//     acl: [
//       {
//         accessType: "grant",
//         type: "everyone",
//         value: "everyone",
//       },
//     ],
//   };

//   const externalItemUrl = `/external/connections/${config.connector.id}/items/${product.ORBISID}`;

//   await client
//     .api(externalItemUrl)
//     .header("Content-Type", "application/json")
//     .put(externalItem);

//   context.log(`Updated item ${product.ORBISID} in Microsoft Graph`);
//   await addItemToTable(product.ORBISID, context);
//   await recordLastModified(product.last_modified_t, context);
// }

// async function deleteItem(itemId: string, context: InvocationContext) {
//   const externalItemUrl = `/external/connections/${config.connector.id}/items/${itemId}`;
//   context.log(`Deleting external item ${externalItemUrl}...`);

//   await client.api(externalItemUrl).delete();

//   context.log(`Removed item ${itemId} from table storage`);
//   await removeItemFromTable(itemId, context);
// }

// app.storageQueue("contentQueue", {
//   connection: "AzureWebJobsStorage",
//   queueName: "queue-content",
//   handler: async (message: ContentMessage, context: InvocationContext) => {
//     context.log("Received message from queue-content");
//     context.log(JSON.stringify(message, null, 2));

//     const { action, crawlType, itemAction, itemId } = message;

//     switch (action) {
//       case "crawl":
//         await crawl(crawlType, context);
//         break;
//       case "item":
//         await processItem(itemId, itemAction, context);
//         break;
//       default:
//         context.log("Unknown action received");
//         break;
//     }
//   },
// });
