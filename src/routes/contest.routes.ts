import { Router } from "express";
import { 
  addProblems, 
  createContest, 
  deleteContest, 
  editContest, 
  enterContest, 
  getAllContests, 
  getContestById, 
  joinContest, 
  startContest,
  updateContestDetails,
  addModerators 
} from "../controllers/contest.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/join-contest/:contestId').post(verifyJWT, joinContest);
router.route('/getAllContests').get(verifyJWT, getAllContests);
router.route('/getContestById/:contestId').get(verifyJWT, getContestById);
router.route('/create-contest').post(verifyJWT, createContest);
router.route('/add-problems/:contestId').post(verifyJWT, addProblems);
router.route('/edit-contest/:contestId').put(verifyJWT, editContest);
router.route('/delete-contest/:contestId').delete(verifyJWT, deleteContest);
router.route('/enter-contest/:contestId').get(verifyJWT, enterContest);
router.route('/start-contest/:contestId').get(verifyJWT, startContest);
router.route('/update-contest/:contestId').put(verifyJWT, updateContestDetails);
router.route('/getContestById/:contestId').get(verifyJWT, getContestById);
router.route('/add-moderators/:contestId').post(verifyJWT, addModerators);
export default router;