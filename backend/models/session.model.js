import mongoose from "mongoose";
import { Schema } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
