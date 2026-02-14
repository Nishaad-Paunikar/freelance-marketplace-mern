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