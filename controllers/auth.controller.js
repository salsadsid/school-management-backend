import { createUser, getUserByEmail } from "../services/auth.service.js";

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, username } = req.body;

    const newUser = await createUser({ name, email, password, role, username });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    console.log(user);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = user.getSignedJwtToken();
    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export default { signup, login };
