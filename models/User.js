import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: {
    type: String,
    required: function () {
      return this.role !== "student";
    },
    unique: true,
  },
  studentId: {
    type: String,
    unique: true,
    required: function () {
      return this.role === "student";
    },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "superadmin", "teacher", "student", "parent", "moderator"],
    default: "student",
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "roleDetails",
  },
  roleDetails: {
    type: String,
    enum: ["UserDetails", "Student"],
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  const isStudent = this.role === "student";
  return isStudent
    ? jwt.sign(
        { id: this._id, studentId: this.studentId, role: this.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      )
    : jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );
};

const User = mongoose.model("User", userSchema);

export default User;
