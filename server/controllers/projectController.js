const Project = require("../models/Project");

// CREATE PROJECT (client only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      client: req.user._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PROJECTS (public)
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("client", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE PROJECT
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name email");

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (project.status !== "assigned")
      return res.status(400).json({
        message: "Project must be assigned before completion"
      });

    project.status = "completed";
    await project.save();

    res.json({
      message: "Project marked as completed",
      project
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};