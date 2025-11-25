const express = require("express");
const authMiddleware = require("../middlwares/auth.middleware");
const {
  followController,
  unfollowController,
  blockController,
  getAlluserController,
  userDpController,
  getProfileController,
  updateProfileController,
  updateBankDetailsController,
  updatePanDetailsController,
  changePasswordController,
} = require("../controllers/user.controller");
const upload = require("../config/multer");

const router = express.Router();

router.get("/follow/:user_id", authMiddleware, followController);
router.get("/unfollow/:user_id", authMiddleware, unfollowController);
router.get("/block/:user_id", authMiddleware, blockController);

// profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("image"),
  userDpController
);

// ✅ profile view/update
router.get("/profile", authMiddleware, getProfileController);
router.put("/profile", authMiddleware, updateProfileController);

// ✅ bank details
router.put("/profile/bank", authMiddleware, updateBankDetailsController);

// ✅ PAN details
router.put("/profile/pan", authMiddleware, updatePanDetailsController);

// ✅ change password
router.put("/profile/password", authMiddleware, changePasswordController);

// existing list users
router.get("/", authMiddleware, getAlluserController);

module.exports = router;
