const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HITAM website
app.use(express.static(path.join(__dirname, "public")));

// Test server
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    website: "HITAM",
    status: "online"
  });
});

// Send index.html for other routes
app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log("================================");
  console.log("       HITAM SERVER STARTED");
  console.log("================================");
  console.log(`Server running on port ${PORT}`);
});
