// This is a toy server that mocks a real server. It has a single endpoint that returns a list of users.
// If there isn't an access token in the request, it will return a 401 status code.
// If there is an access token, it will return a 200 status code with a list of users.
// The server is running on port 3000.
// api.ts

import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/api/users", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  } else {
    // TODO actually verify the token with auth server
    res.status(200).send([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ]);
  }
});

app.get("/api/me", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  } else {
    const response = await fetch(`http://localhost:4000/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      res.status(200).send(data);
    } else {
      res.status(401).send({ error: "Unauthorized" });
      console.error("Unauthorized  " + response.statusText);
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
