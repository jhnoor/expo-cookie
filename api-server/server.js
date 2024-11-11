// This is a toy server that mocks a real server. It has a single endpoint that returns a list of users.
// If there isn't an access token in the request, it will return a 401 status code.
// If there is an access token, it will return a 200 status code with a list of users.
// The server is running on port 3000.

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/api/users", (req, res) => {
  if (!req.headers.authorization) {
    res.status(401).send({ error: "Unauthorized" });
    console.error("Unauthorized");
  } else {
    res.status(200).send([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ]);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
