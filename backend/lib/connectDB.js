import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection successfull");
  } catch (err) {
    console.log("Database connection unsuccessfull", err);
  }
};
