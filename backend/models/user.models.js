import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
