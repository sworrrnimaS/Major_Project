import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Chat from "../models/chat.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Error: Please add WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Webhook verification failed!",
    });
  }

  if (evt.type === "user.created") {
    const newUser = new User({
      clerkUserId: evt.data.id,
      username: evt.data.username || evt.data.email_addresses[0].email_address,
      email: evt.data.email_addresses[0].email_address,
      img: evt.data.profile_img_url,
    });

    await newUser.save();
  }

  if (evt.type === "user.updated") {
    await User.findOneAndUpdate(
      { clerkUserId: evt.data.id }, // Search for the user by clerkUserId
      {
        username:
          evt.data.username || evt.data.email_addresses[0].email_address,
        email: evt.data.email_addresses[0].email_address,
        img: evt.data.profile_img_url,
      },
      { upsert: true, new: true } // Create a new user if not found and return the updated document
    );
  }

  if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkUserId: evt.data.id,
    });
    if (deletedUser) {
      await Session.deleteMany({ user: deletedUser._id });
      await Chat.deleteMany({ user: deletedUser._id });
    }
  }

  return res.status(200).json({
    message: "Webhook received",
  });
};
