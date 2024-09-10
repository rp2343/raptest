const { TableClient, TableServiceClient } = require("@azure/data-tables");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load environment variables from local.settings.json
const settings = require(path.resolve(__dirname, "../local.settings.json"));

// Get API values from local.settings.json
const { API_BASE_URL, API_KEY, API_QUERY } = settings.Values;

(async () => {
    const connectionString = process.argv[2] ? process.argv[2] : "UseDevelopmentStorage=true";
    const reset = process.argv[3] === "--reset" || process.argv[3] === "-r" ? true : false;

    const tableServiceClient = TableServiceClient.fromConnectionString(connectionString);

    async function getTables(tableServiceClient) {
        let tables = [];
        for await (const table of tableServiceClient.listTables()) {
            tables.push(table.name);
        }
        return tables;
    }

    if (reset) {
        const tables = await getTables(tableServiceClient);
        tables.forEach(async table => {
            const tableClient = TableClient.fromConnectionString(connectionString, table);
            console.log(`Deleting table: ${table}`);
            await tableClient.deleteTable();
        });
        let tablesExist = true;
        while (tablesExist) {
            console.log("Waiting for tables to be deleted...");
            const tables = await getTables(tableServiceClient);
            if (tables.length === 0) {
                tablesExist = false;
                console.log("All tables deleted.");
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Make API request to Orbis API
    const apiUrl = `${API_BASE_URL}?range=${encodeURIComponent(JSON.stringify({ 'MAX': 1000, 'OFFSET': 0 }))}`;
    
    console.log(`Fetching data from Orbis API at ${apiUrl}...`);

    try {
        const response = await axios.post(apiUrl, API_QUERY, {
            headers: {
                'ApiToken': `${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Access the Data field in the API response
        const products = response.data.Data;
        const productsFilePath = path.resolve(__dirname, "products.json");

        // Save the fetched products to products.json
        fs.writeFileSync(productsFilePath, JSON.stringify({ products }, null, 2));
        console.log(`Data saved to ${productsFilePath}`);

    } catch (error) {
        console.error("Error fetching data from Orbis API:", error.message);
        return;
    }

    // Read products from products.json
    const jsonString = fs.readFileSync(path.resolve(__dirname, "products.json"), "utf8");
    const { products } = JSON.parse(jsonString);

    const tables = await getTables(tableServiceClient);

    if (tables.includes('products')) {
        console.log(`Table products already exists, skipping...`);
        return;
    }

    let tableCreated = false;
    while (!tableCreated) {
        try {
            await tableServiceClient.createTable('products');
            tableCreated = true;
        } catch (err) {
            if (err.statusCode === 409) {
                console.log('Table is marked for deletion, retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                throw err;
            }
        }
    }

    const tableClient = TableClient.fromConnectionString(connectionString, 'products');

    // Map over the Data field to create rows
    const rows = products.map(product => {
        const {
            _id: rowKey,
            NAME,
            BvDId,
            STATUS,
            EMPL,
            OPRE,
            ORBISID
        } = product;

        return {
            rowKey, // _id
            BvDId,
            NAME,
            STATUS: STATUS[0], // Status is an array, we take the first element
            EMPL,
            OPRE,
            ORBISID
        };
    });

    // Add the products to the Azure table
    rows.forEach(async row => {
        console.log(`Adding ${row.NAME}...`);
        await tableClient.createEntity({
            partitionKey: 'products',
            ...row
        });
    });

})();
