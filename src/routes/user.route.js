import { Router } from "express";
import {
  logginUser,
  logoutUser,
  protect,
  registerUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(logginUser);

router.route("/logout").post(logoutUser);

router.get("/current", protect);

export default router;
