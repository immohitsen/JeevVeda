import mongoose from "mongoose";

const helpDeskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, "Subject cannot exceed 200 characters"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    maxlength: [2000, "Message cannot exceed 2000 characters"],
  },
  category: {
    type: String,
    enum: ["feedback", "bug_report", "feature_request", "other"],
    default: "feedback",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HelpDeskMessage =
  mongoose.models.HelpDeskMessage ||
  mongoose.model("HelpDeskMessage", helpDeskSchema);

export default HelpDeskMessage;
