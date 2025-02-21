import { Router, Request, Response } from "express";
import { authService } from "../../services/auth";
import { getClientIp } from "../../utils/request";
import { validateEmail, validatePassword } from "../../utils/validation";
import { RequestHandler } from "express-serve-static-core";

export const authRouter = Router();

// Type for login request body
interface LoginRequest {
  email: string;
  password: string;
}

// Type for metadata request body
interface MetadataRequest {
  metadata: Record<string, any>;
}

// Type for token request body
interface TokenRequest {
  token: string;
}

// Type for email request body
interface EmailRequest {
  email: string;
}

// Login route
const loginHandler: RequestHandler<{}, any, LoginRequest> = async (
  req,
  res
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const ip = getClientIp(req);
    const response = await authService.signIn(email, password, ip);

    if (response.error) {
      res.status(401).json({ error: response.error.message });
      return;
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate" });
  }
};

// Sign up route
const signupHandler: RequestHandler<{}, any, LoginRequest> = async (
  req,
  res
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    res.status(400).json({ error: emailValidation.errors[0] });
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    res.status(400).json({ error: passwordValidation.errors[0] });
    return;
  }

  try {
    const response = await authService.signUp(email, password);

    if (response.error) {
      res.status(400).json({ error: response.error.message });
      return;
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
};

// Sign out route
const signoutHandler: RequestHandler = async (_req, res) => {
  try {
    const response = await authService.signOut();

    if (response.error) {
      res.status(400).json({ error: response.error.message });
      return;
    }

    res.json({ message: "Successfully signed out" });
  } catch (error) {
    res.status(500).json({ error: "Failed to sign out" });
  }
};

// Reset password route
const resetPasswordHandler: RequestHandler<{}, any, EmailRequest> = async (
  req,
  res
) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    res.status(400).json({ error: emailValidation.errors[0] });
    return;
  }

  try {
    const response = await authService.resetPassword(email);

    if (response.error) {
      res.status(400).json({ error: response.error.message });
      return;
    }

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reset password email" });
  }
};

// Verify email route
const verifyEmailHandler: RequestHandler<{}, any, TokenRequest> = async (
  req,
  res
) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: "Token is required" });
    return;
  }

  try {
    const response = await authService.verifyEmail(token);

    if (response.error) {
      res.status(400).json({ error: response.error.message });
      return;
    }

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify email" });
  }
};

// Get current user route
const getCurrentUserHandler: RequestHandler = async (_req, res) => {
  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user information" });
  }
};

// Update user metadata route
const updateMetadataHandler: RequestHandler<{}, any, MetadataRequest> = async (
  req,
  res
) => {
  const { metadata } = req.body;

  if (!metadata) {
    res.status(400).json({ error: "Metadata is required" });
    return;
  }

  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    await authService.updateUserMetadata(user.id, metadata);
    res.json({ message: "Metadata updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user metadata" });
  }
};

// Register routes
authRouter.post("/login", loginHandler);
authRouter.post("/signup", signupHandler);
authRouter.post("/signout", signoutHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.post("/verify-email", verifyEmailHandler);
authRouter.get("/me", getCurrentUserHandler);
authRouter.patch("/me/metadata", updateMetadataHandler);
