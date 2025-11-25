const PostModel = require("../models/post.mode");
const userModel = require("../models/user.model");
const uploadImage = require("../services/storage.services");

const creatPostController = async (req, res) => {
  try {
    const { tags, location, caption } = req.body;
    if (!req.files) {
      return res.status(404).json({
        msg: "Image is required",
      });
    }
    let uploadedUrlArr = await Promise.all(
      req.files.map(
        async (element) =>
          await uploadImage(element.buffer, element.originalname)
      )
    );
    let newPost = await PostModel.create({
      user_id: req.user._id,
      caption,
      location,
      tags,
      imageUrl: uploadedUrlArr.map((elem) => elem.url),
    });
    let user = await userModel.findById(req.user._id);
    user.post.push(newPost._id);
    await user.save();
    if (newPost) {
      return res.status(400).json({
        msg: "bad request",
      });
    }
    return res.status(201).json({
      msg: "post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.log("error in upload controller", error);
    return res.status(500).json({
      msg: "bad request from upload controller",
      error: error,
    });
  }
};
const upodatePostController = async (req, res) => {
  try {
    const { location, caption, url, tags, post_id } = req.body;
    let updatePost = await PostModel.findByIdAndUpdate(
      { _id: post_id },
      {
        location,
        caption,
        imageUrl: url,
        tags,
      },
      {
        new: true,
      }
    );
    if (!updatePost) {
      return res.status(400).json({
        Msg: "failed to update post",
      });
    }
    return res.status(200).json({
      message: "Post updated",
      updatedPost: updatePost,
    });
  } catch (error) {
    console.log("error in update post->", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};

const getAllPostController = async (req, res) => {
  try {
    let posts = await PostModel.find({});
    if (!posts) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    return res.status(200).json({
      message: "All posts ",
      posts: posts,
    });
  } catch (error) {
    console.log("error in get all post->", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
const getLoggedinUserPosts = async (req, res) => {
  try {
    let user_id = req.user.id;
    if (!user_id) return res.status(404).json({ Msg: "User id not found" });
    let loggedinUserPosts = await userModel
      .findById(req.user.id)
      .populate("posts");
    return res.status(200).json({
      msg: "User posts found",
      userPosts: loggedinUserPosts,
    });
  } catch (error) {
    console.log("error in get logged in user's posts->", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    let post_id = req.params.post_id;
    if (!post_id) return res.status(404).json("post not found");
    await PostModel.findByIdAndDelete(post_id);
    return res.status(200).json({
      msg: "post is deleted",
    });
  } catch (error) {
    console.log("error in delete post->", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};

const linkeController = async (req, res) => {
  try {
    let post_id = req.params.post_id;
    if (!post_id) {
      return res.status(404).json({
        msg: "Post id not found",
      });
    }
    let currentPost = await PostModel.findById(post_id);
    currentPost.likes.push(req.user._id);
    currentPost.save();
    return res.status(200).json({
      msg: "post liked",
    });
  } catch (error) {
    console.log("error in delete post->", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
const unlikeController = async(req , res)=>{
  try {
    let post_id = req.params.post_id;
    if(!post_id){
      return res.status(404).json({
        msg:"post id not found",
      })
    }
    let currentPost = await PostModel.findById(post_id);
    currentPost.likes.splice(req.user._id,1);
    currentPost.save();


    
  } catch (error) {
     console.log("error in delete post->", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
}

module.exports = {
  creatPostController,
  upodatePostController,
  getAllPostController,
  getLoggedinUserPosts,
  deletePost,
  linkeController,
  unlikeController

};
