const userModel = require("../models/user.model");

const getAllFollowerForChat = async (req, res) => {
  try {
    let allFollowersForChat = await userModel
      .findOne({
        _id: req.user._id,
      })
      .populate("following");
    if (allFollowersForChat.following.length === 0)
      return res.status(404).json({ msg: "user not found" });

    return res.status(200).json({
      msg: "following users fetched",
      allFollowing: allFollowersForChat,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
      error: error,
    });
  }
};

module.exports = { getAllFollowerForChat };
