import { AUTH_SERVER } from "@/constants/paths";
import { TokenResponse } from "@/servers/models";

// continue the login flow
const redirectUri = "http://localhost:8081/bff/continue";

const clientSecret = "secret123";
const clientId = "client123";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    console.error("No code found in the URL: " + url);
  }

  const response = await fetch(`${AUTH_SERVER}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
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

  console.log("Got the token, redirecting to the app");

  const data: TokenResponse = await response.json();

  console.log("Token data", data);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": `bff_token=${data.access_token}; Path=/`,
    },
  });
}
