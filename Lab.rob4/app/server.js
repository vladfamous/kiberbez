const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

let config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"),
);

app.use(cors());

app.get("/set-mode/:mode", (req, res) => {
  config.mode = req.params.mode;

  fs.writeFileSync(
    path.join(__dirname, "config.json"),
    JSON.stringify(config, null, 2),
  );

  res.send(`Mode set to ${config.mode}`);
});

if (config.mode === "csp-strict") {
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self';");
    next();
  });
}

if (config.mode === "csp-balanced") {
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src *; style-src *; script-src 'self' http://localhost:4000 http://localhost:7000 http://localhost:5000;",
    );
    next();
  });
}

const emails = JSON.parse(
  fs.readFileSync(path.join(__dirname, "emails.json"), "utf-8"),
);

app.get("/api/emails", (req, res) => {
  res.json(emails);
});

app.get("/login", (req, res) => {
  const username = req.query.user;

  const users = {
    john: "abc-123-xyz",
    Alice: "def-456-uvw",
  };

  if (!users[username]) {
    return res.send("User not found");
  }

  const sessionId = users[username];

  res.setHeader("Set-Cookie", `SessionID=${sessionId}; Path=/api; HttpOnly`);

  res.send(`Logged in as ${username}`);
});

app.get("/", (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

  if (config.mode === "mode-sri-active") {
    html = html.replace(
      `<script src="http://localhost:7000/react-mock.js"></script>`,
      `<script 
        src="http://localhost:7000/react-mock.js"
        integrity="sha256-Gsk7feihON1xEcXHNJAY3rH1hhR0kBqhR07EeQcb7tM="
        crossorigin="anonymous">
      </script>`,
    );
  }

  res.send(html);
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
