import { app, HttpRequest, InvocationContext } from "@azure/functions";
import { ConnectionMessage } from "../common/ConnectionMessage";
import { getQueueClient } from "../common/queueClient";
import { validateToken } from "../common/validateToken";
import { streamToJson } from "../common/utils";
import { config } from "../common/config";

enum TargetConnectorState {
    Enabled = 'enabled',
    Disabled = 'disabled',
}

app.http('notification', {
    methods: ['POST'],
    handler: async (request: HttpRequest, console: InvocationContext) => {

        (async () => {
            const body = await streamToJson(request.body);
            console.log('Received notification');
            console.log(JSON.stringify(body, null, 2));

            const {
                aadAppTenantId: tenantId,
                aadAppClientId: clientId
            } = config;

            const token = body?.validationTokens[0];
            console.log(`Validating token: ${token}, tenantId: ${tenantId}, clientId: ${clientId}...`);
            await validateToken(token, tenantId, clientId);
            console.log('Token validated');

            const changeDetails = body?.value[0]?.resourceData;
            const targetConnectorState = changeDetails?.state;

            const message: ConnectionMessage = {
                connectorId: changeDetails?.id,
                connectorTicket: changeDetails?.connectorsTicket
            }

            if (targetConnectorState === TargetConnectorState.Enabled) {
                message.action = 'create';
            }
            else if (targetConnectorState === TargetConnectorState.Disabled) {
                message.action = 'delete';
            }

            if (!message.action) {
                console.error('Invalid action');
                return;
            }

            console.log(JSON.stringify(message, null, 2));

            const queueClient = await getQueueClient('queue-connection');
            const messageString = btoa(JSON.stringify(message));
            console.log('Sending message to queue queue-connection: ${message}');
            // must base64 encode
            await queueClient.sendMessage(messageString);
            console.log('Message sent');
        })();

        return {
            status: 202
        }
    }
})

// import { app, HttpRequest, InvocationContext } from "@azure/functions";
// import { ConnectionMessage } from "../common/ConnectionMessage";
// import { validateToken } from "../common/validateToken";
// import { streamToJson } from "../common/utils";
// import { config } from "../common/config";
// import { client as graphClient } from "../common/graphClient";  // Use the graphClient initialized with authentication

// enum TargetConnectorState {
//     Enabled = 'enabled',
//     Disabled = 'disabled',
// }

// app.http('notification', {
//     methods: ['POST'],
//     handler: async (request: HttpRequest, context: InvocationContext) => {
//         try {
//             // Convert stream to JSON
//             const body = await streamToJson(request.body);
//             context.log('Received notification:', JSON.stringify(body, null, 2));

//             // Extract tenantId and clientId from config
//             const { aadAppTenantId: tenantId, aadAppClientId: clientId } = config;

//             // Validate the token
//             const token = body?.validationTokens?.[0];
//             if (token) {
//                 context.log(`Validating token: ${token}, tenantId: ${tenantId}, clientId: ${clientId}...`);
//                 await validateToken(token, tenantId, clientId);
//                 context.log('Token validated');
//             } else {
//                 context.log('No validation token found');
//                 return { status: 400, body: "Invalid token" };
//             }

//             // Extract change details and determine the action
//             const changeDetails = body?.value?.[0]?.resourceData;
//             const targetConnectorState = changeDetails?.state;

//             const message: ConnectionMessage = {
//                 connectorId: changeDetails?.id,
//                 connectorTicket: changeDetails?.connectorsTicket,
//             };

//             if (targetConnectorState === TargetConnectorState.Enabled) {
//                 message.action = 'create';
//             } else if (targetConnectorState === TargetConnectorState.Disabled) {
//                 message.action = 'delete';
//             }

//             if (!message.action) {
//                 context.log('Invalid action. No action to process.');
//                 return { status: 400, body: "Invalid action" };
//             }

//             // Log and send the message to Microsoft Graph
//             const messageString = JSON.stringify(message);
//             context.log(`Sending message to Microsoft Graph: ${messageString}`);

//             await graphClient.api('/path/to/graph/endpoint')  // Replace with actual Microsoft Graph API endpoint
//                 .post({ message: messageString });

//             context.log('Message sent to Microsoft Graph successfully');

//             return { status: 202 };  // Accepted

//         } catch (error) {
//             context.log('Error processing notification:', error);
//             return { status: 500, body: `Internal Server Error: ${error.message}` };
//         }
//     }
// });
