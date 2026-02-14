const express = require("express");
const router = express.Router();
const { createProposal, getProjectProposals, acceptProposal } =
  require("../controllers/proposalController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// freelancer submits proposal
router.post("/", protect, authorizeRoles("freelancer"), createProposal);


// client views proposals
router.get("/:projectId", protect, authorizeRoles("client"), getProjectProposals);

router.put("/accept/:id", protect, authorizeRoles("client"), acceptProposal);

module.exports = router;

