const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cacheClient = require("../services/chache.service");
const emailTemplate = require("../utils/emailTemplate");
const { sendMail } = require("../services/mail.service");

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,                      // Render (https) pe required
  sameSite: isProd ? "none" : "lax",   // PROD me cross-site allow
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",                           // sab routes ke liye
};

const registerController = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!fullName || !email || !password) {
      return res.status(422).json({
        message: "All fields are required",
      });
    }

    let existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(409).json({
        msg: "user already exist",
      });
    }

    const newUser = await userModel.create({
      fullName,
      email,
      password,
    });

    if (!newUser) {
      return res.status(400).json({
        msg: "error in creating new user",
      });
    }

    const token = createTokenAndSetCookie(newUser, res);

    return res.status(201).json({
      msg: "user created succefully",
      user: newUser,
    });
  } catch (error) {
    console.log("error in register user----------->", error);

    return res.status(500).json({
      msg: "internal server error",
      error: error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
      });
    }

    const decryptPass = await user.comparePassword(password);

    if (!decryptPass) {
      return res.status(401).json({
        msg: "invalid credential",
      });
    }

    const token = createTokenAndSetCookie(user, res);

    return res.status(200).json({
      msg: "user logged in successfully",
      user,
    });
  } catch (error) {
    console.log("error-------->", error);

    return res.status(500).json({
      msg: "internal server error",
      error: error,
    });
  }
};

const logOutController = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      await cacheClient.set(token, "blacklisted", {
        EX: 7 * 24 * 60 * 60,
      });
    }

    // ✅ cookie ko clear karo
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      msg: "user logged out successfully",
    });
  } catch (error) {
    console.log("error in logout", error);
    return res.status(500).json({
      msg: "internal server error",
      error,
    });
  }
};

const forgotPasscontroller = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
      });
    }

    let rawToken = jwt.sign({ id: user._id }, process.env.JWT_RAW_SECRET, {
      expiresIn: "30m",
    });

    let resetLink = `http://localhost:3000/api/auth/reset-password/${rawToken}`;

    let resetTemplate = emailTemplate({ fullName: user.fullName, resetLink });

    let response = await sendMail(
      user.email,
      "Reset password",
      resetTemplate
    );

    return res.send("ok");
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      msg: "internal server error",
      error: error,
    });
  }
};

const createTokenAndSetCookie = (user, res) => {
  const token = user.JWTTokenGenration();

  res.cookie("token", token, cookieOptions);

  return token;
};

module.exports = {
  registerController,
  loginController,
  logOutController,
  forgotPasscontroller,
  createTokenAndSetCookie,
};
