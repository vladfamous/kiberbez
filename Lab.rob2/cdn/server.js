const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 7000;

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"),
);

if (config.mode === "mode1") {
  app.use(cors());
}

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("CDN Server running");
});

app.listen(PORT, () => {
  console.log(`CDN running on http://localhost:${PORT}`);
});
