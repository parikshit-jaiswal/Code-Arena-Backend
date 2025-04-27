import e from "express";
import { getAdminInfo, loginAdmin, registerAdmin } from "../controllers/admin.controllers.js";
import router from "./test.routes.js";
import { createContest } from "../controllers/contest.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

//protected routes
router.route("/get-admin").get(verifyJWT, getAdminInfo);
router.route("/create-contest").post(verifyJWT, createContest);

export default router;