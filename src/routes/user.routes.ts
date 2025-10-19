import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  verifyLoginOTP,
  forgetPassword,
  verifyResetPasswordOTP,
  updatePassword,
  getUserData,
  googleLogin,
  getManageableContests,
  updateProfilePicture,
  getUserById,
  followAndUnfollow, // Add this import
  searchFriendByName, // Add this import
  suggestedUsersToFollow, // Add this import
  getProfileOfUser, // Add this import
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllContests,
  joinContest,
} from "../controllers/contest.controllers.js";
import { uploadProfilePicture } from "../middlewares/upload.middleware";

const router = Router();

// Keep existing routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/v").post(verifyLoginOTP);
router.route("/forgot-password").post(forgetPassword);
router.route("/verify-reset-password-otp").post(verifyResetPasswordOTP);
router.route("/update-password").post(updatePassword);
router.route("/google").post(googleLogin);

//protected routes here
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-user-data").get(verifyJWT, getUserData);
router.get("/manageable-contests", verifyJWT, getManageableContests);
router
  .route("/profile-picture")
  .post(
    verifyJWT,
    uploadProfilePicture.single("profilePicture"),
    updateProfilePicture
  );

// Add new route to get user by ID
router.route("/current").get(verifyJWT, getUserData); // New route for current user
router.route("/:userId").get(verifyJWT, getUserById); // Route for getting user by ID

// Add the missing social feature routes
router.route("/follow").post(verifyJWT, followAndUnfollow);
router.route("/search-friends").post(verifyJWT, searchFriendByName);
router.route("/suggested-users").get(verifyJWT, suggestedUsersToFollow);
router.route("/profile/:userId").get(verifyJWT, getProfileOfUser);

export default router;
