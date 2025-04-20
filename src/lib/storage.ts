import { SnapTradeUser } from "./snaptrade/types";

const USER_STORAGE_KEY = "snaptrade_user";

export class StorageHelpers {
  public static getUser(): SnapTradeUser | null {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  public static setUser(user: SnapTradeUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  public static clearUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}
