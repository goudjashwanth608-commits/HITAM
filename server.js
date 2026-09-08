const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HITAM website
app.use(express.static(path.join(__dirname, "public")));

// Server status
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    website: "HITAM",
    status: "online"
  });
});

// Main website
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log("================================");
  console.log("       HITAM SERVER STARTED");
  console.log("================================");
  console.log(`Open: http://localhost:${PORT}`);
});
