const express = require("express");
const router = express.Router();
const { completeProject } = require("../controllers/projectController");
const {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// client only
router.post("/", protect, authorizeRoles("client"), createProject);

// client views their own projects (MUST be before /:id)
router.get("/my", protect, authorizeRoles("client"), getMyProjects);

// public
router.get("/", getProjects);

// public
router.get("/:id", getProjectById);

router.put("/complete/:id", protect, authorizeRoles("client"), completeProject);

module.exports = router;