import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: process.env.VITE_MICROSOFT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const microsoftLoginRequest = {
  scopes: ["User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);