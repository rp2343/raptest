import { resultLayout } from "./resultLayout";

export const config = {
  aadAppTenantId: process.env.AAD_APP_TENANT_ID,
  aadAppClientId: process.env.AAD_APP_CLIENT_ID,
  aadAppClientSecret: process.env.AAD_APP_CLIENT_SECRET,
  storageAccountConnectionString: process.env.AzureWebJobsStorage,
  notificationEndpoint: process.env.NOTIFICATION_ENDPOINT,
  graphSchemaStatusInterval: parseInt(process.env.GRAPH_SCHEMA_STATUS_INTERVAL) || 60,
  connector: {
    // 3-32 characters
    id: 'companies-connector',
    name: 'Companies-connector',
    description: 'Contains information of all Companies listed in Orbis.',
    searchSettings: {
      searchResultTemplates: [
        {
          id: 'companies-connector',
          priority: 1,
          layout: resultLayout
        }
      ]
    },
    // https://learn.microsoft.com/graph/connecting-external-content-manage-schema
    schema: [
      {
        name: 'NAME',
        type: 'String',
        isQueryable: true,
        isSearchable: true,
        isRetrievable: true,
        labels: [
          'title'
        ]
      },
      {
        name: 'BvDId',
        type: 'String',
        isQueryable: true,
        isSearchable: true,
        isRetrievable: true
      },
      {
        name: 'Status',
        type: 'String',
        isQueryable: true,
        isSearchable: true,
        isRetrievable: true
      },
      {
        name: 'OPRE',
        type: 'String',
        isSearchable: true,
        isRetrievable: true
      },
      {
        name: 'EMPL',
        type: 'String',
        isSearchable: true,
        isRetrievable: true
      },
      {
        name: 'ORBISID',
        type: 'String',
        isQueryable: true,
        isSearchable: true,
        isRetrievable: true
      },
    ]
  }
};