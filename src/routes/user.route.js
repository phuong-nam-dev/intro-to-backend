import { Router } from "express";
import {
  authMiddleware,
  getCurrentUser,
  logginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(logginUser);

router.route("/logout").post(logoutUser);

router.get("/me", authMiddleware, getCurrentUser);

export default router;
