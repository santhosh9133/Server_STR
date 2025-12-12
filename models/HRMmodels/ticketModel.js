const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    CompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },
    eventCategory: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["Technical", "HR", "Finance", "Admin", "Other"], // optional - you can adjust
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    ticketDescription: {
      type: String,
      required: [true, "Ticket description is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // assuming tickets are raised by employees
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
