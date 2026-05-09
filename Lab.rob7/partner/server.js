const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

if (config.mode === "mode1") {
  app.use(cors());
}

app.use(express.static(__dirname));

app.get("/api/support", (req, res) => {
  res.json({ message: "No new messages." });
});

app.get("/", (req, res) => {
  res.send("Partner Server running");
});

app.listen(PORT, () => {
  console.log(`Support server running on http://localhost:${PORT}`);
});
