export type User = {
  id: number;
  username: string;
  password: string;
};
export type Client = {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  grants: string[];
};
export type AuthorizationCode = {
  clientId: string;
  userId: number;
};
export type AccessToken = {
  userId: number;
  expires: Date;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
