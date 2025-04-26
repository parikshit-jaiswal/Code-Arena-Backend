import e from "express";
import { getAdminInfo, loginAdmin, registerAdmin } from "../controllers/admin.controllers";
import router from "./test.routes";
import { createContest } from "../controllers/contest.controllers";
import { verifyJWT } from "../middlewares/auth.middleware";

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

//protected routes
router.route("/get-admin").get(verifyJWT, getAdminInfo);
router.route("/create-contest").post(verifyJWT, createContest);

export default router;