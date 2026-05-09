const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 7000;

let config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"),
);

app.use(cors());

app.get("/set-mode/:mode", (req, res) => {
  const newMode = req.params.mode;

  config.mode = newMode;

  fs.writeFileSync(
    path.join(__dirname, "config.json"),
    JSON.stringify(config, null, 2),
  );

  res.send(`Mode switched to: ${newMode}`);
});

app.get("/react-mock.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");

  if (config.mode === "breach") {
    res.send(`alert("CRITICAL: CDN Compromised! Stealing data...");`);
  } else {
    res.send(`
      console.log("React v1.0.1 loaded from CDN");`);
  }
});

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("CDN Server running");
});

app.listen(PORT, () => {
  console.log(`CDN running on http://localhost:${PORT}`);
});
