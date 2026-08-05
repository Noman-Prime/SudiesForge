import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    contactnumber: {
      type: String,
      trim: true,
      match: [/^\d{11}$/, "Enter a valid number"],
    },
    country: {
      type: String,
      required: true,
    },
    profileimage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    passwordResetToken: String,
    passwordResetTime: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.compare = async function (enterPassword) {
  return bcrypt.compare(enterPassword, this.password);
};

userSchema.methods.jsonwebtoken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      role: this.role,
    },
    process.env.USER_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTime = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const user =
  mongoose.models.User || mongoose.model("User", userSchema);

export default user;