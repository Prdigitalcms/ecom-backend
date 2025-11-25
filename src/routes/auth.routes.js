const express = require("express");
const {
  registerController,
  loginController,
  logOutController,
  forgotPasscontroller,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlwares/auth.middleware");
const userModel = require("../models/user.model");
const router = express.Router();

router.get("/me",authMiddleware, (req, res) => {
  // console.log(req.user);
  
  return res.status(200).json({
    msg: "current logged in user ",
    user: req.user,
  });
});

router.get("/reset-password/:token", async (req, res) => {
  let token = req.params.token;

  if (!token)
    return res.status(403).json({
      message: "Token not found, BAD request",
    });

  let decode = jwt.verify(token, process.env.JWT_RAW_SECRET);

  res.render("index.ejs", { user_id: decode.id });
});

router.post("/update-password/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let password = req.body.password;

    // console.log("user password", password, id);

    if (!id) {
      return res.status(404)({
        msg: "Bad request",
      });
    }
    let updateUser = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        password,
      }
    );
    return res.status(200).json({
      msg: "password updated successfully",
      user: updateUser,
    });
  } catch (error) {
    console.log("error in upadating pass_----->", error);

    return res.status(500).json({
      msg: "bad request",
      error: error,
    });
  }
});
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", authMiddleware, logOutController);
router.post("/forgot-password", forgotPasscontroller);
module.exports = router;
