export type User = {
  id: number;
  username: string;
  password: string;
};

export type Client = {
  clientId: string;
  redirectUris: string[];
  grants: ("authorization_code" | "refresh_token")[];
};

export type AuthorizationCode = {
  clientId: string;
  userId: number;
};

export type Token = {
  userId: number;
  expires_at: Date;
  type: "access" | "refresh";
};

export type TokenResponse = {
  token: string;
  // you might be wondering why this isn't expires_at?
  // https://mailarchive.ietf.org/arch/msg/oauth/fWh2ki1nn14I6loiP-LNSq14RBM/
  // > expires_at requires very good time synchronization for all machines involved
  // > Do you know how many PCs and browsers have their clock set incorrectly?
  expires_in: number;
};

export type AuthResponse = {
  access_token: TokenResponse;
  refresh_token?: TokenResponse;
};
