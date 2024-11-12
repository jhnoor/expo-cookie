import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

app.get("/api/users", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("GET /api/users", token);

  if (token && (await isTokenValid(token))) {
    res.status(200).send(users);
  } else {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  }
});

app.post("/api/users", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("POST /api/users", token);

  if (token && (await isTokenValid(token))) {
    const user = { ...req.body, id: users.length + 1 };
    users.push(user);
    res.status(200).send(user);
  } else {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("DELETE /api/users/:id", token);

  if (token && (await isTokenValid(token))) {
    const id = parseInt(req.params.id);
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      const user = users.splice(index, 1)[0];
      res.status(200).send(user);
    } else {
      res.status(404).send({ error: "User not found" });
      console.error("User not found");
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  }
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("PUT /api/users/:id", token);

  if (token && (await isTokenValid(token))) {
    const id = parseInt(req.params.id);
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      const user = req.body;
      users[index] = user;
      res.status(200).send(user);
    } else {
      res.status(404).send({ error: "User not found" });
      console.error("User not found");
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  }
});

app.get("/api/me", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("GET /api/me", token);

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

const isTokenValid = async (token: string) => {
  const response = await fetch(`http://localhost:4000/introspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return response.ok;
};
