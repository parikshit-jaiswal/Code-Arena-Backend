import { Router } from "express";
import { addProblems, createContest, getAllContests, joinContest } from "../controllers/contest.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/join-contest/:contestId').post(verifyJWT, joinContest);
router.route('/getAllContests').get(verifyJWT, getAllContests);
router.route('/create-contest').post(verifyJWT, createContest);
router.route('/edit-contest/:contestId').post(verifyJWT, addProblems);

export default router;