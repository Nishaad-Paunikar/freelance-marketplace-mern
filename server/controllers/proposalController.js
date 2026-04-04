const Proposal = require("../models/Proposal");
const Project  = require("../models/Project");


// ── FREELANCER: submit proposal ──────────────────────────────────────────────
exports.createProposal = async (req, res) => {
  try {
    const { projectId, message, bidAmount } = req.body;

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.status !== "open")
      return res.status(400).json({ message: "Project is no longer accepting proposals" });

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      message,
      bidAmount
    });

    res.status(201).json(proposal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── FREELANCER: get own proposals ────────────────────────────────────────────
exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate("project", "title budget status client")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── FREELANCER: edit own proposal (pending only) ─────────────────────────────
exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    if (proposal.freelancer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (proposal.status !== "pending")
      return res.status(400).json({ message: "Cannot edit a proposal that has already been reviewed" });

    const { message, bidAmount } = req.body;
    if (message)   proposal.message   = message;
    if (bidAmount) proposal.bidAmount = Number(bidAmount);

    await proposal.save();
    res.json(proposal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── FREELANCER: delete own proposal (pending only) ───────────────────────────
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    if (proposal.freelancer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (proposal.status !== "pending")
      return res.status(400).json({ message: "Cannot delete a proposal that has already been reviewed" });

    await proposal.deleteOne();
    res.json({ message: "Proposal deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── CLIENT: view proposals for their project ──────────────────────────────────
exports.getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const proposals = await Proposal.find({ project: project._id })
      .populate("freelancer", "name email");

    res.json(proposals);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ── CLIENT: accept a proposal ────────────────────────────────────────────────
exports.acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("project");

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const project = await Project.findById(proposal.project._id);

    if (project.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (project.status !== "open")
      return res.status(400).json({ message: "Project already assigned" });

    // Accept this proposal
    proposal.status = "accepted";
    await proposal.save();

    // Reject all other proposals for the same project
    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id } },
      { status: "rejected" }
    );

    // Update project
    project.status = "assigned";
    project.assignedFreelancer = proposal.freelancer;
    await project.save();

    res.json({ message: "Proposal accepted", project });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};