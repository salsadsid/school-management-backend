import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: function () {
        return this.role !== "student";
      },
      validate: {
        validator: async function (email) {
          // Skip validation if the user is a student
          if (this.role === "student") return true;

          // Check if another user already exists with the same email
          const existingUser = await mongoose.models.User.findOne({ email });
          return !existingUser || existingUser._id.equals(this._id);
        },
        message: "Email already in use",
      },
    },
    studentId: {
      type: String,
      unique: function () {
        return this.role === "student";
      },
      required: function () {
        return this.role === "student";
      },
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "superadmin",
        "teacher",
        "student",
        "parent",
        "moderator",
      ],
      default: "student",
      required: true,
    },
    originalPassword: {
      type: String,
      // required: true,
    },
    details: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "roleDetails",
    },
    roleDetails: {
      type: String,
      enum: ["Teacher", "Student", "Parent", "Admin", "Moderator"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.originalPassword) {
    user.originalPassword = user.password;
  }

  next();
});

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.getSignedJwtToken = function () {
  const payload =
    this.role === "student"
      ? { id: this._id, studentId: this.studentId, role: this.role }
      : { id: this._id, email: this.email, role: this.role };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("User", userSchema);

export default User;
