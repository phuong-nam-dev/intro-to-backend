import { Router } from "express";
import {
  logginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(logginUser);

router.route("/logout").post(logoutUser);

export default router;
