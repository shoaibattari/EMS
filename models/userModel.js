import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    userRole: { type: String, default: "user" },
    avatar: {
      url:{ type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    dob: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id, name: this.name, userRole: this.userRole },
    process.env.JWT_SECRET,
    {
      expiresIn: "15d",
    }
  );
};

const user = mongoose.model("user", userSchema);
export default user;
