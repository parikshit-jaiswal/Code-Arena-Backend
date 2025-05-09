import { Router } from "express";
import { addProblems, createContest, enterContest, getAllContests, joinContest, startContest } from "../controllers/contest.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/join-contest/:contestId').post(verifyJWT, joinContest);
router.route('/getAllContests').get(verifyJWT, getAllContests);
router.route('/create-contest').post(verifyJWT, createContest);
router.route('/edit-contest/:contestId').post(verifyJWT, addProblems);
router.route('/enter-contest/:contestId').get(verifyJWT, enterContest);
router.route('/start-contest/:contestId').get(verifyJWT, startContest);

export default router;