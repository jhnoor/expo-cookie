# Expo Router as BFF for auth example

## Get started

1. Install dependencies

   ```bash
   yarn i
   ```

2. Install and start the API Server

   ```bash
   cd api-server
   yarn i
   yarn start
   ```

3. Start the app

   ```bash
   npx expo start
   ```

![BFF Diagram](docs/bff.png)

## TODO

- [x] Show example of entire oauth2 auth code flow with BFF
- [ ] SecureStore example for app
- [ ] when on web, intercept all api calls to API via BFF so that it can add access_token
