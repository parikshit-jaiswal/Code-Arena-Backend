import { Router } from "express";
import { runAllTestCases, runCode } from "../controllers/code.controllers.js";

const router = Router();

router.route("/execute").post(runCode);
router.route("/execute-all").post(runAllTestCases);


export default router;