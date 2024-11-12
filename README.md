# Expo API Routes as BFF for auth example

This showcases how to use Expo API Routes as a BFF for handling OAuth2 auth code flow. You can read more about this pattern in [The Backend for Frontend Pattern (Auth0)](https://auth0.com/blog/the-backend-for-frontend-pattern-bff/).

![BFF Diagram](docs/bff.png)

## Get started

1. Install and start the API and auth servers

   ```bash
   cd servers
   yarn i
   yarn api
   yarn auth
   ```

2. Run the expo app

   ```bash
   yarn i
   yarn web
   ```

## TODO

- [x] Show example of entire oauth2 auth code flow with BFF
- [ ] SecureStore example for app
- [x] when on web, intercept all api calls to API via BFF so that it can add access_token
