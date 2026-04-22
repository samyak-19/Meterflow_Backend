require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const apiRoutes =require("./routes/apiRoutes");
const gatewayRoutes = require("./routes/gatewayRoutes")

const ConnectDB = require("./config/db");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/apis", apiRoutes);
app.use("/gateway",gatewayRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});