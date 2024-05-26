import { Router } from "express";
import {
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  registerUser, 
  changeCurrentPassword, 
  getCurrentUser, 
  updateAccountDetais,
  updateAvatarImage, 
  updateCoverImage, 
  getUserChannelProfile, 
  getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
      {
        name : "avatar",
        maxCount: 1
      },
      {
        name:"coverImage",
        maxCount : 1
      }
    ]),
    registerUser
    );
router.route("/login").post(loginUser)

// Secured Routes
router.route("/logout").post( verifyJWT, logoutUser)
router.route("/refresh_token").post(refreshAccessToken)
router.route("/change_password").post(verifyJWT, changeCurrentPassword)
router.route("/Current_User").get(verifyJWT, getCurrentUser)
router.route("/update_Account_Detais").patch(verifyJWT, updateAccountDetais)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarImage)
router.route("/cove_Image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get( getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT, getWatchHistory)



export default router 
 