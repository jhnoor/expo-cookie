# api.js

[Mocks](/docs/mockbob.png) the API server that the BFF will call to get the data. It is a simple express server that returns the data in the format that the BFF expects. If there is not access token in the request, it will return a 401 error.

# auth.js

[Mocks](/docs/mockbob.png) the **auth** server that the BFF will call to get the access token. It is a simple express server that returns the access token in the format that the BFF expects.

## Running the server

To run the server, you need to have node installed. Then you can run the following commands:

```bash
npm install
npm start
```
