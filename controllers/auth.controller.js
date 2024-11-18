import { createUser, getUserByEmail } from "../services/auth.service.js";

const signup = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const newUser = await createUser({ email, password, role });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    // console.log(user);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
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
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export default { signup, login, verifyToken };
