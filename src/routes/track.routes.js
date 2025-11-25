const router = require("express").Router();
const authMiddleware = require("../middlwares/auth.middleware");
const upload = require("../config/multer");
const {
  createTrackController,
  getMyTracksController,
  getTrackByIdController,
  updateTrackDetailsController,
  updateTrackStatusController,
} = require("../controllers/track.controller");

// Create new track (upload)
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "coverArt", maxCount: 1 },
  ]),
  createTrackController
);

// List tracks of current user with filter/search/sort/pagination
router.get("/", authMiddleware, getMyTracksController);

// Get single track (details)
router.get("/:id", authMiddleware, getTrackByIdController);

// Update track (user) – cannot change audio file, publicId, status
router.put(
  "/:id",
  authMiddleware,
  upload.fields([{ name: "coverArt", maxCount: 1 }]),
  updateTrackDetailsController
);

// Update track status (ADMIN USE)
// TODO: add proper admin auth check before using in production
router.patch("/:id/status", authMiddleware, updateTrackStatusController);

module.exports = router;
