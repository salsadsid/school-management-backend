import config from "../config/config.js";
import User from "../models/User.js";
import {
  createUser,
  getUserByEmail,
  getUserByEmailAndDetails,
  getUserByStudentId,
} from "../services/auth.service.js";

const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Resolve the role details and model dynamically
    const roleDetails = config.roleDetailsMap[role];
    const RoleModel = config.modelMap2[roleDetails];

    if (!RoleModel) throw new Error("Invalid role");

    // Create the user without transaction
    const newUser = await createUser({
      email,
      password,
      role,
      roleDetails,
      name,
    });

    // Create the role-specific profile
    const newRole = await RoleModel.create([
      {
        userId: newUser._id,
        name,
        email,
      },
    ]);

    // Update the user with the role-specific ID
    await User.findByIdAndUpdate(newUser._id, { details: newRole[0]._id });

    res.status(201).json({ newUser, newRole: newRole[0] });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email = " ", password, studentId = "" } = req.body;
  try {
    let user;
    if (studentId) {
      user = await getUserByStudentId(studentId);
    } else {
      user = await getUserByEmail(email);
    }
    console.log(user);
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }
    const token = user.getSignedJwtToken();
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    // console.log(req.user);
    const email = req.user.email;
    const user = await getUserByEmailAndDetails(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (user) res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export default { signup, login, verifyToken };
