import { Router } from "express";
import { runCode } from "../controllers/code.controllers";

const router = Router();

router.route("/execute").post(runCode);


export default router;