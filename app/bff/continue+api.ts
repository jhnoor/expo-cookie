// We can't securely store tokens on the device in the web client, so we need to exchange the code for a token on the server-side BFF.
// This is the endpoint that the auth server redirects to after the user logs in on the web client.
// It will exchange the code for a token and redirect back to the app with a httpOnly cookie containing the token.
// This is a simple example, in a real app you would store the token with the secure flag, and ensure it is only sent over HTTPS.

import { AUTH_SERVER, WEB_CLIENT_ID } from "@/lib/constants";
import { TokenResponse } from "@/servers/models";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// 2. Continue the auth flow
// This is the endpoint that the auth server redirects to after the user logs in
// It will exchange the code for a token and redirect back to the app
export async function GET(request: Request) {
  // Auth has redirected to AuthBFF with a code
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    console.error("No code found in the URL: " + url);
  }

  // 3. Exchange code for access token
  const response = await fetch(`${AUTH_SERVER}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      client_id: WEB_CLIENT_ID,
    }),
  });

  if (!response.ok) {
    console.error("Failed to get token: " + response.statusText);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const data: TokenResponse = await response.json();

  console.log("AuthBFF has successfully exchanged code for access token", data);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/", // TODO use state to redirect to the original page instead of the home page
      // 4. Bake the access token into a httpOnly cookie
      // Note: This is a simple example, in a real app you would store the token with the secure flag, and ensure it is only sent over HTTPS
      "Set-Cookie": `bff_token=${data.access_token}; Path=/; HttpOnly`,
    },
  });
}
