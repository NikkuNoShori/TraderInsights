import { SnapTradeConfig } from "./types";

export class SnapTradeService {
  private config: SnapTradeConfig;

  constructor(config: SnapTradeConfig) {
    this.config = config;
  }

  async createConnectionLink(
    userId: string,
    userSecret: string
  ): Promise<{ redirectUri: string }> {
    try {
      console.log("Creating connection link with credentials:", {
        userId,
        hasUserSecret: !!userSecret,
        isDemo: this.config.isDemo,
      });

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiBaseUrl}/snaptrade/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userSecret }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create connection link:", errorData);
        throw new Error(
          errorData.message || "Failed to create connection link"
        );
      }

      const data = await response.json();
      console.log("Connection link created successfully:", data);

      // Ensure we have a redirectUri in the response
      if (!data.redirectUri) {
        throw new Error("No redirectUri in response");
      }

      return { redirectUri: data.redirectUri };
    } catch (error) {
      console.error("Error creating connection link:", error);
      throw error;
    }
  }
}
