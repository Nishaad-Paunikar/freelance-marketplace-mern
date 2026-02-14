const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// client only
router.post("/", protect, authorizeRoles("client"), createProject);

// public
router.get("/", getProjects);

// public
router.get("/:id", getProjectById);

module.exports = router;