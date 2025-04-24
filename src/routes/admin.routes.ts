import e from "express";
import { loginAdmin, registerAdmin } from "../controllers/admin.controllers";
import router from "./test.routes";

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

export default router;