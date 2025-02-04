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
    sessionSummary: {
      type: String,
      default: "",
    },
    sessionTitle: {
      type: String,
      default: "",
    },
    summaryCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
