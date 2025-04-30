import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, verifyLoginOTP, forgetPassword, verifyResetPasswordOTP, updatePassword } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllContests, joinContest } from "../controllers/contest.controllers.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route('/v').post(verifyLoginOTP);
router.route('/forgot-password').post(forgetPassword);
router.route('/verify-reset-password-otp').post(verifyResetPasswordOTP);
router.route('/update-password').post(updatePassword);


//protected routes here
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);


export default router;
