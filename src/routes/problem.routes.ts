import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { submitSolution } from "../controllers/problem.controllers.js";

const router = Router();

router.route('/submit-solution/:contestId/:problemId').post(verifyJWT, submitSolution);

export default router