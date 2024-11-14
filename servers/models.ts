export type User = {
  id: number;
  username: string;
  password: string;
};

export type Client = {
  clientId: string;
  redirectUris: string[];
  grants: string[];
};

export type AuthorizationCode = {
  clientId: string;
  userId: number;
};

export type Token = {
  userId: number;
  expires: Date;
  type: "access" | "refresh";
};

export type TokenResponse = {
  token: string;
  expires_in: number;
};

export type AuthResponse = {
  access_token: TokenResponse;
  refresh_token?: TokenResponse;
};
