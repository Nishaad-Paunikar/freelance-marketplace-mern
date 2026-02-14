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