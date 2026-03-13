import { Router } from "express";
import {
  login,
  register,
  getLoginUser,
} from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validationRequest";
import { loginSchema, registerSchema } from "../middlewares/loginAuth";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// POST /auth/register
router.post("/register", validateRequest(registerSchema), register);

// POST /auth/login
router.post("/login", validateRequest(loginSchema), login);

// GET /auth/get-user - protected route
router.get("/get-user", authenticateToken, getLoginUser);

export default router;
