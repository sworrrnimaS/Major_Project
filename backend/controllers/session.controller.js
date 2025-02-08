import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Chat from "../models/chat.model.js";

export const createNewSession = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res
        .status(401)
        .json({
          status: "fail",
          message: "Not Authenticated to create a new Session!",
        });
    }

    const user = await User.findOne({ clerkUserId });

    const session = new Session({
      user: user._id,
    });

    const savedSession = await session.save();
    await User.findByIdAndUpdate(
      user._id,
      { $push: { sessionIds: savedSession._id } },
      { new: true }
    );

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
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res
        .status(401)
        .json({
          status: "fail",
          message: "Not Authenticated to getAllSessions for user!",
        });
    }

    const user = await User.findOne({ clerkUserId });

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

export const deleteAllSessionsAndChatsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Session.deleteMany({ user: userId });
    await Chat.deleteMany({ user: userId });

    await User.findByIdAndUpdate(
      { _id: userId },
      { sessionIds: [] },
      { new: true }
    );
    res
      .status(200)
      .json(`All Sessions successfully deleted for user with id : ${userId}`);
  } catch (err) {
    console.error("Error occured while deleting all Sessions for user: ", err);
    res.status(500).json({
      message: "Error occured while deleting all Sessions for user: ",
      error: err,
    });
  }
};
