import { Router } from "express";
import {
  getSuggestedUsers,
  searchUsers,
  followUnfollowUser,
} from "../controllers/social.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All social routes require authentication
router.use(verifyJWT);

// Social feature routes
router.route("/suggested-users").get(getSuggestedUsers);
router.route("/search-users").post(searchUsers);
router.route("/follow").post(followUnfollowUser);

export default router;