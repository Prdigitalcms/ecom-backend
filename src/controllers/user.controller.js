const userModel = require("../models/user.model");
const uploadImage = require("../services/storage.services");

const followController = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(404).json({
        msg: "user id not found",
      });
    }

    let currentUser = await userModel.findById(req.user._id);

    currentUser.following.push(user_id);
    currentUser.save();

    let followedUser = await userModel.findById(user_id);
    followedUser.followers.push(req.user._id);
    followedUser.save();

    return res.status(200).json({
      message: "Followed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};
const unfollowController = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    if (!user_id) {
      return res.status(404).json({
        msg: "user id not found",
      });
    }
    const currentUser = await userModel.findById(req.user._id);
    currentUser.following.splice(user_id, 1);
    currentUser.save();

    let unfollowedUser = await userModel.findById(user_id);
    unfollowedUser.followers.splice(req.user._id, 1);
    unfollowedUser.save();
    return res.status(200).json({
      msg: "Unfollowed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

const blockController = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    if (!user_id) {
      return res.status(404).json({
        msg: "usr id not found",
      });
    }
    let currentUser = await userModel.findById(req.user._id);
    currentUser.blockedUser.push(user_id);
    currentUser.save();

    return res.status(200).json({
      msg: "usr blocked",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

const getAlluserController = async (req, res) => {
  try {
    let currentUser = req.user.id;
    // console.log(currentUser);

    let allUsers = await userModel.find({ _id: { $ne: currentUser } });
    // console.log(allUsers);
    return res.status(200).json({
      msg: "fetched all user",
      allUsers: allUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

const userDpController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(404).json({
        msg: "file not found",
      });
    }
    // console.log(req.file)
    let imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    let updateUser = await userModel.findByIdAndUpdate(
      userId,
      { dp: imageUrl.url },
      { new: true }
    );
    return res.status(200).json({
      msg: "profile photo uploaded",
      dp: updateUser.dp,
    });
  } catch (error) {
    console.error("Error in uploadDpController:", error);
    return res.status(500).json({
      msg: "Internal server error",
      error,
    });
  }
};
// helper: sanitize string
const s = (val) => (typeof val === "string" ? val.trim() : val || "");

// 1) GET PROFILE (for logged-in user)
const getProfileController = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("-password"); // never send password

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({
      msg: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("getProfileController error", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 2) UPDATE PERSONAL PROFILE
const updateProfileController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const errors = {};

    if (!firstName || !firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!lastName || !lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!email || !email.trim()) {
      errors.email = "Email is required";
    }

    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) {
      errors.phone = "Invalid phone format";
    }
    if (pincode && !/^\d{4,10}$/.test(pincode)) {
      errors.pincode = "Invalid pincode";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        msg: "Validation failed",
        errors,
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.firstName = s(firstName);
    user.lastName = s(lastName);
    user.fullName = `${s(firstName)} ${s(lastName)}`.trim();
    user.email = s(email).toLowerCase();
    user.phone = s(phone);
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
    user.address = s(address);
    user.city = s(city);
    user.state = s(state);
    user.pincode = s(pincode);

    await user.save();

    const sanitized = user.toObject();
    delete sanitized.password;

    return res.status(200).json({
      msg: "Profile updated successfully",
      user: sanitized,
    });
  } catch (error) {
    console.error("updateProfileController error", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 3) UPDATE BANK DETAILS
const updateBankDetailsController = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
    } = req.body;

    const errors = {};

    if (!accountHolderName || !accountHolderName.trim()) {
      errors.accountHolderName = "Account holder name is required";
    }
    if (!accountNumber || !/^\d{8,20}$/.test(accountNumber)) {
      errors.accountNumber = "Invalid account number";
    }
    if (!ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      errors.ifscCode = "Invalid IFSC code";
    }
    if (!bankName || !bankName.trim()) {
      errors.bankName = "Bank name is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        msg: "Validation failed",
        errors,
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.bankDetails = {
      accountHolderName: s(accountHolderName),
      accountNumber: String(accountNumber).trim(),
      ifscCode: String(ifscCode).trim().toUpperCase(),
      bankName: s(bankName),
      branchName: s(branchName),
    };

    await user.save();

    const sanitized = user.toObject();
    delete sanitized.password;

    return res.status(200).json({
      msg: "Bank details updated successfully",
      user: sanitized,
    });
  } catch (error) {
    console.error("updateBankDetailsController error", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 4) UPDATE PAN DETAILS
const updatePanDetailsController = async (req, res) => {
  try {
    const { panNumber, panHolderName, fatherName, dateOfBirth, panCardImage } =
      req.body;

    const errors = {};

    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      errors.panNumber = "Invalid PAN number";
    }
    if (!panHolderName || !panHolderName.trim()) {
      errors.panHolderName = "PAN holder name is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        msg: "Validation failed",
        errors,
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.panDetails = {
      panNumber: String(panNumber).trim().toUpperCase(),
      panHolderName: s(panHolderName),
      fatherName: s(fatherName),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      panCardImage: s(panCardImage),
    };

    await user.save();

    const sanitized = user.toObject();
    delete sanitized.password;

    return res.status(200).json({
      msg: "PAN details updated successfully",
      user: sanitized,
    });
  } catch (error) {
    console.error("updatePanDetailsController error", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

// 5) CHANGE PASSWORD (logged-in user)
const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(422).json({
        msg: "Current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(422).json({
        msg: "New password must be at least 8 characters",
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        msg: "Current password is incorrect",
      });
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({
        msg: "New password must be different from old password",
      });
    }

    user.password = newPassword; // will be hashed in pre-save
    await user.save();

    // optional: issue new token so old tokens expire
    const token = user.JWTTokenGenration();
    res.cookie("token", token);

    return res.status(200).json({
      msg: "Password updated successfully",
    });
  } catch (error) {
    console.error("changePasswordController error", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

module.exports = {
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
};
