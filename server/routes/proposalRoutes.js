const express = require("express");
const router = express.Router();

const {
  createProposal,
  getProjectProposals
} = require("../controllers/proposalController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// freelancer submits proposal
router.post("/", protect, authorizeRoles("freelancer"), createProposal);


// client views proposals
router.get("/:projectId", protect, authorizeRoles("client"), getProjectProposals);

module.exports = router;