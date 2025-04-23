import { Router } from "express";
import { runCode } from "../controllers/code.controllers.js";

const router = Router();

router.route("/execute").post(runCode);


export default router;