const express = require("express");
const router  = express.Router();

const {
  createProposal,
  getMyProposals,
  getProjectProposals,
  acceptProposal,
  updateProposal,
  deleteProposal
} = require("../controllers/proposalController");

const protect        = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ── Freelancer: submit proposal ──────────────────────────────────────────────
router.post("/", protect, authorizeRoles("freelancer"), createProposal);

// ── Freelancer: get own proposals (MUST be before /:projectId) ───────────────
router.get("/my", protect, authorizeRoles("freelancer"), getMyProposals);

// ── Client: view proposals for a project ────────────────────────────────────
router.get("/:projectId", protect, authorizeRoles("client"), getProjectProposals);

// ── Client: accept a proposal (MUST be before PUT /:id) ─────────────────────
router.put("/accept/:id", protect, authorizeRoles("client"), acceptProposal);

// ── Freelancer: edit own proposal ────────────────────────────────────────────
router.put("/:id", protect, authorizeRoles("freelancer"), updateProposal);

// ── Freelancer: delete own proposal ──────────────────────────────────────────
router.delete("/:id", protect, authorizeRoles("freelancer"), deleteProposal);

module.exports = router;
