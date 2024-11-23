import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "superadmin", "teacher", "student", "parent", "moderator"],
    default: "student",
    required: true,
  },
  extra: {
    type: Object,
  },
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

export default UserDetails;
