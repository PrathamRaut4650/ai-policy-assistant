require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const aiRoutes = require("./routes/aiRoutes")

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = require("./config/db");



const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


connectDB();

const policyRoutes = require("./routes/policyRoutes");
const authRoutes = require("./routes/authRoutes")


app.use("/api/auth",authRoutes)
app.use("/api/policies", policyRoutes);
app.use("/api/ai",aiRoutes)

app.get("/", (req, res) => {
    res.send("AI Policy Assistant API is Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});