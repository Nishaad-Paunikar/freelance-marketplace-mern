const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    bidAmount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);