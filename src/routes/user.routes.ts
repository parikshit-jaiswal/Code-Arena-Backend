import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controllers";
import { verifyJWT } from "../middlewares/auth.middleware";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


//protected routes here
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
