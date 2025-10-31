const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hash, role });
    res.json({ message: "User Registered Successfully!", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong Password" });

    const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1d" });

    res.json({ message: "Login Successful", token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
