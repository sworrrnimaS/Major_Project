import User from "../models/user.model.js";
import Session from "../models/session.model.js";

export const createNewSession = async (req, res) => {
  try {
    const clerkUserId = "user_2pw0QKQQ4YxSCfgD5ctwVKjfMo0";
    const user = await User.findOne({ clerkUserId });

    const session = new Session({
      user: user._id,
    });

    const savedSession = await session.save();

    res
      .status(200)
      .json({ message: "New Session Created", session: savedSession });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Session creation failed", error: err.message });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId });

    const sessions = await Session.find({ user: user._id });
    if (sessions)
      res.status(200).json({ message: "User Sessions: ", sessions });
    else res.status(200).json({ message: "User has no Sessions: ", sessions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Fetching User Sessions failed: ", error: err.message });
  }
};
