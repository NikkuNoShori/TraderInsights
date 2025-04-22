import { Router, Request, Response } from "express";
import { secureStorage } from "../services/secureStorage";

const router = Router();

// Save user data
router.post("/save-user", async (req: Request, res: Response) => {
  try {
    const userId = secureStorage.validateSession(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await secureStorage.saveUserData(userId, req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user data
router.get("/get-user", async (req: Request, res: Response) => {
  try {
    const userId = secureStorage.validateSession(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = await secureStorage.getUserData(userId);
    if (!data) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clear user data
router.post("/clear-user", async (req: Request, res: Response) => {
  try {
    const userId = secureStorage.validateSession(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    secureStorage.clearUserData(userId);
    secureStorage.clearSession(req, res);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error clearing user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create session
router.post("/create-session", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const sessionId = secureStorage.createSession(userId, res);
    res.status(200).json({ sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validate session
router.get("/validate-session", async (req: Request, res: Response) => {
  try {
    const userId = secureStorage.validateSession(req);
    if (!userId) {
      return res.status(401).json({ error: "Invalid session" });
    }

    res.status(200).json({ userId });
  } catch (error) {
    console.error("Error validating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clear session
router.post("/clear-session", async (req: Request, res: Response) => {
  try {
    secureStorage.clearSession(req, res);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error clearing session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
