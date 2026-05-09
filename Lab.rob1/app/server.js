const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"),
);

if (config.mode === "mode1") {
  app.use(cors());
}

const emails = JSON.parse(
  fs.readFileSync(path.join(__dirname, "emails.json"), "utf-8"),
);

app.get("/api/emails", (req, res) => {
  res.json(emails);
});

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
