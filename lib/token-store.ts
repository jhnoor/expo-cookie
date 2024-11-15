import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_KEYS } from "./constants";

export class TokenStore {
  private static instance: TokenStore;

  private readonly memory = {
    accessToken: null as string | null,
    refreshToken: null as string | null,
    expiresAt: null as Date | null,
  };

  private constructor() {} // Prevent direct instantiation

  static getInstance(): TokenStore {
    if (!TokenStore.instance) {
      TokenStore.instance = new TokenStore();
    }
    return TokenStore.instance;
  }

  async load(): Promise<void> {
    if (!this.memory.refreshToken) {
      this.memory.refreshToken = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.REFRESH_TOKEN
      );
    }
    if (!this.memory.accessToken) {
      this.memory.accessToken = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.ACCESS_TOKEN
      );
    }
    if (!this.memory.expiresAt) {
      const expiresAt = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.EXPIRES_AT
      );
      if (expiresAt) {
        this.memory.expiresAt = new Date(parseInt(expiresAt, 10));
      }
    }
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    this.memory.refreshToken = refreshToken;

    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.REFRESH_TOKEN,
      refreshToken
    );
  }

  async setAccessToken(accessToken: string, expiresAt: Date): Promise<void> {
    this.memory.accessToken = accessToken;
    this.memory.expiresAt = expiresAt;

    await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.EXPIRES_AT,
      expiresAt.getTime().toString()
    );
  }

  async clearTokens(): Promise<void> {
    this.memory.accessToken = null;
    this.memory.refreshToken = null;
    this.memory.expiresAt = null;

    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EXPIRES_AT);
  }

  isTokenExpired(): boolean {
    return this.memory.expiresAt ? this.memory.expiresAt < new Date() : true;
  }

  get accessToken(): string | null {
    return this.memory.accessToken;
  }

  get refreshToken(): string | null {
    return this.memory.refreshToken;
  }

  get expiresAt(): Date | null {
    return this.memory.expiresAt;
  }
}
