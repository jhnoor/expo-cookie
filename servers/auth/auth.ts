// Simple OAuth2 Authorization Server using Express.js
import express from "express";
import bodyParser from "body-parser";
import querystring from "querystring";
import path from "path";
import { AuthorizationCode, AccessToken } from "../models";

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = [{ id: 1, username: "foo", password: "bar" }];

const clients = [
  {
    clientId: "client123",
    clientSecret: "secret123",
    redirectUris: ["http://localhost:8081/bff/continue"],
    grants: ["authorization_code"],
  },
];

const authorizationCodes: { [code: string]: AuthorizationCode } = {}; // Map codes to clientId and userId
const accessTokens: { [token: string]: AccessToken } = {}; // Map tokens to userId

// 1. The auth flow starts here, as the user is navigated to the login page
// It is the responsibility of the client to send the user here. The client should
// include the client_id and redirect_uri in the query string
app.get("/login", (req, res) => {
  console.log("/login", req.query);
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password, client_id, redirect_uri } = req.body;
  console.log("/login", req.body);

  // Validate client
  const client = clients.find((c) => c.clientId === client_id);
  if (!client) {
    console.error("Invalid client");
    res.status(400).send("Invalid client");
    return;
  }

  if (!client.redirectUris.includes(redirect_uri)) {
    console.error("Invalid redirect URI");
    res.status(400).send("Invalid redirect URI");
    return;
  }

  // Authenticate user
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    // Generate authorization code
    const code = Math.random().toString(36).substring(2, 15);
    authorizationCodes[code] = { clientId: client_id, userId: user.id };

    // Redirect to client's redirect URI with code
    const redirectUrl = `${redirect_uri}?code=${code}`;
    res.redirect(redirectUrl);
  } else {
    console.error("Invalid credentials");
    res.status(401).send("Invalid credentials");
  }
});

// Authorization endpoint
app.get("/authorize", (req, res) => {
  console.log("/authorize", req.query);

  const { client_id, redirect_uri } = req.query;

  // Validate client
  const client = clients.find(
    (c) =>
      c.clientId === client_id &&
      c.redirectUris.includes(redirect_uri as string)
  );
  if (!client) {
    console.error("Invalid client or redirect URI");
    res.status(400).send("Invalid client or redirect URI");
    return;
  }

  // In a real application, you would employ some form of session management
  // For simplicity, we'll just redirect to the login page
  res.redirect(
    `/login?${querystring.stringify(req.query as Record<string, string>)}`
  );
});

// Token endpoint
app.post("/token", (req, res) => {
  console.log("/token", req.body);
  const { grant_type, code, client_id, client_secret } = req.body;

  // Validate client
  const client = clients.find(
    (c) => c.clientId === client_id && c.clientSecret === client_secret
  );
  if (!client) {
    console.error("Invalid client credentials: " + client_id);
    res.status(401).send("Invalid client credentials");
    return;
  }

  if (grant_type === "authorization_code") {
    const authCode = authorizationCodes[code];
    if (authCode && authCode.clientId === client_id) {
      // Generate access token
      const accessToken = Math.random().toString(36).substring(2, 15);
      accessTokens[accessToken] = {
        userId: authCode.userId,
        expires: new Date(Date.now() + 60000), // 1 minute
      };

      // Remove used authorization code
      delete authorizationCodes[code];

      // Respond with access token
      console.log(`Exchanging code ${code} for access_token ${accessToken}`);
      res.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: accessTokens[accessToken].expires.getTime() - Date.now(),
      });
    } else {
      console.error("Invalid authorization code");
      res.status(400).send("Invalid authorization code");
    }
  } else {
    console.error("Unsupported grant type");
    res.status(400).send("Unsupported grant type");
  }
});

app.get("/me", (req, res) => {
  console.log("/me", req.headers);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("Missing authorization header");
    res.status(401).send("Missing authorization header");
    return;
  }

  const token = authHeader.split(" ")[1];
  const tokenData = accessTokens[token];
  const user = users.find((u) => u.id === tokenData.userId);

  if (tokenData && user) {
    res.json({ id: user.id, username: user.username });
  } else {
    console.error("Invalid access token");
    res.status(401).send("Invalid access token");
  }
});

app.post("/introspect", (req, res) => {
  const { token } = req.body;
  console.log("/introspect", req.body);

  const tokenData = accessTokens[token];
  if (tokenData) {
    if (tokenData.expires < new Date()) {
      console.error("Token expired");
      delete accessTokens[token];
      res.status(401).send("Token expired");
    } else {
      const expiresIn = Math.round(
        (tokenData.expires.getTime() - Date.now()) / 1000
      );
      console.log(`Token is valid for ${expiresIn} more seconds`);
      res.status(200).send();
    }
  } else {
    res.status(401).send("Invalid access token");
  }
});

app.listen(port, () => {
  console.log(`OAuth2 Authorization Server running on port ${port}`);
});
