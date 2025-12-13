import { Router } from "express";
import {
  getCurrentUser,
  logginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verifyAccessToken,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(logginUser);

router.route("/logout").post(logoutUser);

router.post("/refresh-token", refreshToken);

router.get("/me", verifyAccessToken, getCurrentUser);

export default router;
