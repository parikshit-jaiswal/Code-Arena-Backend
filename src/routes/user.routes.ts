import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshToken } from "../controllers/user.controllers";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


//protected routes here
router.route("/logout").post(verifyJWT, logoutUser); 
router.route("/refresh-token").post(refreshToken);

export default router;
