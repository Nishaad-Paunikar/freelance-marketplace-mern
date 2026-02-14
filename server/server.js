const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const projectRoutes = require("./routes/projectRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

dotenv.config();
connectDB();
require("./models/User");

const app = express();

// BODY PARSER FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OTHER MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());

// ROUTES AFTER MIDDLEWARE
app.use("/api/auth", authRoutes);

// TEST ROUTE
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server running'
  });
});

app.use("/api/proposals", proposalRoutes);

app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});