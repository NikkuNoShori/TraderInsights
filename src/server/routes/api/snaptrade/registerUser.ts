import { Router } from "express";
import { registerUser } from "../../../../server/api/snaptrade/registerUser";

const router = Router();

// Handle POST requests to /api/snaptrade/registerUser
router.post("/", registerUser);

export default router;
