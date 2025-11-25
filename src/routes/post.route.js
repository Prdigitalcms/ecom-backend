const expess = require("express");
const upload = require("../config/multer");
const authMiddleware = require("../middlwares/auth.middleware");
const { creatPostController, upodatePostController, getAllPostController, getLoggedinUserPosts, deletePost, linkeController, unlikeController } = require("../controllers/post.controller");

const router = expess.Router();

router.post("/creat-post",authMiddleware,upload.array("images",5),creatPostController);

router.get("/update",authMiddleware,upodatePostController);
router.get("/allposts",authMiddleware,getAllPostController);
router.get("/user-posts",authMiddleware,getLoggedinUserPosts);
router.get("/delete/:id",authMiddleware,deletePost);
router.get("/like/:post_id",authMiddleware,linkeController);
router.get("/unlike/:post_id",authMiddleware,unlikeController);
module.exports = router;