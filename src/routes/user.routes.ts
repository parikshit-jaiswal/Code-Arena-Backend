import { Router } from "express";
import { loginUser, registerUser, verifyOTP } from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyOTP);


export default router;
