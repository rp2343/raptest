import { ClientSecretCredential } from '@azure/identity';
import { Client, MiddlewareFactory } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import { config } from './config';
import { ProxyAgent } from 'undici';


const credential = new ClientSecretCredential(
  config.aadAppTenantId,
  config.aadAppClientId,
  config.aadAppClientSecret
);

const dispatcher = process.env.https_proxy ? new ProxyAgent(process.env.https_proxy) : undefined;

const fetchOptions: any = {
  dispatcher
};

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
});

const middleware = MiddlewareFactory.getDefaultMiddlewareChain(authProvider);

export const client = Client.initWithMiddleware({ middleware, fetchOptions });

// export async function startCrawl(crawlType: CrawlType) {
//   const message: ContentMessage = {
//     action: 'crawl',
//     crawlType: crawlType
//   };

//   try {
//     // Sending the crawl message to Microsoft Graph using the graphClient
//     const encodedMessage = btoa(JSON.stringify(message));
    
//     const result = await client.api('/me/messages') // Or any other relevant endpoint
//       .post({
//         subject: 'Crawl Request',
//         body: {
//           contentType: 'Text',
//           content: encodedMessage  // Sending the message as the content
//         }
//       });

//     console.log('Crawl request sent successfully:', result);
//   } catch (error) {
//     console.error('Error sending crawl request:', error);
//   }
// }