import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getProblem, getProblemById, submitSolution } from "../controllers/problem.controllers.js";
import { getContestProblems } from "../controllers/contest.controllers.js";

const router = Router();

router.route('/submit-solution/:contestId/:problemId').post(verifyJWT, submitSolution);
router.route('/get-problem/:contestId/:problemId').get(verifyJWT, getProblem);
router.route('/get-problemById/:problemId').get(verifyJWT, getProblemById);

export default router
