import mongoose from "mongoose";
import { Schema } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    query: {
      type: String,
    },
    response: {
      type: String,
    },
    resolvedQuery: {
      type: String,
    },
    isLTM: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Chat", chatSchema);
