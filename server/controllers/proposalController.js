const Proposal = require("../models/Proposal");
const Project = require("../models/Project");


// freelancer submits proposal
exports.createProposal = async (req, res) => {
  try {
    const { projectId, message, bidAmount } = req.body;

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

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


// client views proposals for their project
exports.getProjectProposals = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const proposals = await Proposal.find({ project: project._id })
      .populate("freelancer", "name email");

    res.json(proposals);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("project");

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const project = await Project.findById(proposal.project._id);

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (project.status !== "open") {
      return res.status(400).json({ message: "Project already assigned" });
    }

    project.status = "assigned";
    project.assignedFreelancer = proposal.freelancer;

    await project.save();

    res.json({
      message: "Proposal accepted",
      project
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};