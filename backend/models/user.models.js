import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    primaryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    alternateNumber: {
      type: String,
      required: false,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
