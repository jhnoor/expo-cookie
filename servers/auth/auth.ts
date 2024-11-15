import express from "express";
import bodyParser from "body-parser";
import querystring from "querystring";
import path from "path";
import {
  AuthorizationCode,
  AuthResponse,
  Client,
  Token,
  User,
} from "../models";

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const accessTokenExpiresInMs = 60 * 1000; // 1 minute
const refreshTokenExpiresInMs = 60 * 10 * 1000; // 10 minutes

// This is a simple example, in a real app you would store users and clients in a database
const users: User[] = [{ id: 1, username: "foo", password: "bar" }];
const clients: Client[] = [
  {
    // Web client. Note that we redirect to the server-side BFF, in order to securely exchange the code for a token and set a cookie
    clientId: "myWebClient",
    redirectUris: ["http://localhost:8081/bff/continue"],
    grants: ["authorization_code", "refresh_token"],
  },
  {
    // Native client. The app can securely store the access and refresh tokens using the platform's secure storage, so we redirect to the app's own continue page
    clientId: "myNativeClient",
    redirectUris: ["expocookie://continue"],
    grants: ["authorization_code", "refresh_token"],
  },
];

const authorizationCodes: { [code: string]: AuthorizationCode } = {}; // Map codes to clientId and userId
const tokens: { [token: string]: Token } = {};

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
  const { grant_type, code, client_id } = req.body;

  // Validate client
  const client = clients.find((c) => c.clientId === client_id);
  if (!client) {
    console.error("Invalid client credentials: " + client_id);
    res.status(401).send("Invalid client credentials");
    return;
  }

  if (grant_type === "authorization_code") {
    const authCode = authorizationCodes[code];
    if (authCode?.clientId === client_id) {
      // Generate access token
      const accessToken = generateAccessToken(authCode.userId);

      // Generate refresh token if grant type includes refresh token
      const refreshToken = client.grants.includes("refresh_token")
        ? Math.random().toString(36).substring(2, 15)
        : null;

      if (refreshToken) {
        tokens[refreshToken] = {
          userId: authCode.userId,
          expires_at: new Date(Date.now() + refreshTokenExpiresInMs),
          type: "refresh",
        };
      }

      // Remove used authorization code
      delete authorizationCodes[code];

      // Respond with access token
      const auth: AuthResponse = {
        access_token: {
          token: accessToken,
          expires_in: secondsToExpire(tokens[accessToken].expires_at),
        },
      };

      if (refreshToken) {
        auth.refresh_token = {
          token: refreshToken,
          expires_in: secondsToExpire(tokens[refreshToken].expires_at),
        };
      }

      console.log(`Exchanging code ${code} for access_token ${accessToken}`);
      if (refreshToken) {
        console.log(`You also received a refresh_token ${refreshToken}`);
      }

      res.json(auth);
    } else {
      console.error("Invalid authorization code");
      res.status(400).send("Invalid authorization code");
    }
  } else if (grant_type === "refresh_token") {
    const refreshToken = req.body.refresh_token;
    console.log("refresh_token", refreshToken);
    const tokenData = tokens[refreshToken];
    if (tokenData?.type === "refresh" && tokenData.expires_at > new Date()) {
      // Generate new access token
      const accessToken = generateAccessToken(tokenData.userId);

      // Respond with access token
      const auth: AuthResponse = {
        access_token: {
          token: accessToken,
          expires_in: secondsToExpire(tokens[accessToken].expires_at),
        },
      };

      console.log(
        `Exchanging refresh_token ${refreshToken} for access_token ${accessToken}`
      );
      res.json(auth);
    } else {
      console.error("Invalid refresh token");
      res.status(400).send("Invalid refresh token");
    }
  } else {
    console.error("Unsupported grant type");
    res.status(400).send("Unsupported grant type");
  }
});

// TODO remove this endpoint, only complicates the example
app.get("/me", (req, res) => {
  console.log("/me", req.headers);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("Missing authorization header");
    res.status(401).send("Missing authorization header");
    return;
  }

  const token = authHeader.split(" ")[1];
  const tokenData = tokens[token];

  if (!tokenData || tokenData.expires_at < new Date()) {
    console.error("Token expired");
    delete tokens[token];
    res.status(401).send("Token expired");
    return;
  }

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

  const tokenData = tokens[token];

  if (!tokenData || tokenData.expires_at < new Date()) {
    console.error("Invalid access token");
    delete tokens[token];
    res.status(401).send("Invalid access token");
    return;
  }

  const expiresIn = Math.round(
    (tokenData.expires_at.getTime() - Date.now()) / 1000
  );
  console.log(`Token is valid for ${expiresIn} more seconds`);
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`OAuth2 Authorization Server running on port ${port}`);
});

const generateAccessToken = (userId: number) => {
  const accessToken = Math.random().toString(36).substring(2, 15);
  tokens[accessToken] = {
    userId,
    expires_at: new Date(Date.now() + accessTokenExpiresInMs), // 1 minute
    type: "access",
  };
  return accessToken;
};

const secondsToExpire = (expires_at: Date) =>
  (expires_at.getTime() - Date.now()) / 1000;
