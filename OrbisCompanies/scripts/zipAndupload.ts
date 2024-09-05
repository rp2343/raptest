import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/graph-auth';
import { InteractiveBrowserCredential } from '@azure/identity';
import { zipDirectory } from './zipPackage';

const uploadAppToTeams = async (zipFilePath: string) => {
    // Authenticate using MSAL
    const credential = new InteractiveBrowserCredential({
        clientId: process.env.CLIENT_ID!,
        tenantId: process.env.TENANT_ID!,
        redirectUri: 'http://localhost'
    });

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
    });

    const graphClient = Client.initWithMiddleware({ authProvider });

    // Read the zip file
    const zipData = fs.readFileSync(zipFilePath);

    // Upload the app package
    const appPackage = await graphClient.api('/appCatalogs/teamsApps')
        .header('Content-Type', 'application/zip')
        .post(zipData);

    console.log('App uploaded successfully:', appPackage);
};

// First, zip the directory
const sourceDir = path.join(__dirname, '../');
const outPath = path.join(__dirname, '../companies-connector.zip');

zipDirectory(sourceDir, outPath);

// Then, upload it to Teams Admin Center
uploadAppToTeams(outPath).catch(console.error);
