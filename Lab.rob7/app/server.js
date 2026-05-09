const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const sessions = {};
const SESSION_TTL = 2 * 60 * 1000;

let config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function getSessionId(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie.match(/SessionID=([^;]+)/);
  return match ? match[1] : null;
}

function getCookieAttributes() {
  let attrs = "Path=/; HttpOnly";

  if (config.mode === "csrf-samesite-lax") {
    attrs += "; SameSite=Lax";
  }

  if (config.mode === "csrf-samesite-strict" || config.mode === "csrf-token") {
    attrs += "; SameSite=Strict";
  }

  return attrs;
}

function validateSession(req, res) {
  const sessionId = getSessionId(req);

  if (!sessionId || !sessions[sessionId]) {
    res.status(401).send("Unauthorized");
    return null;
  }

  const session = sessions[sessionId];

  if (Date.now() - session.createdAt > SESSION_TTL) {
    delete sessions[sessionId];
    res.status(401).send("Session expired");
    return null;
  }

  return { sessionId, session };
}

app.get("/login", (req, res) => {
  const username = req.query.user;

  const users = {
    John: "abc-123-xyz",
    Alice: "def-456-uvw",
  };

  if (!users[username]) {
    return res.status(404).send("User not found");
  }

  const sessionId = users[username];
  const csrfToken = crypto.randomBytes(32).toString("hex");

  sessions[sessionId] = {
    createdAt: Date.now(),
    csrfToken,
  };

  res.setHeader(
    "Set-Cookie",
    `SessionID=${sessionId}; ${getCookieAttributes()}`,
  );

  if (config.mode === "csrf-token") {
    return res.json({
      message: `Logged in as ${username}`,
      csrfToken,
    });
  }

  res.send(`Logged in as ${username}`);
});

app.get("/api/csrf-token", (req, res) => {
  const result = validateSession(req, res);
  if (!result) return;

  res.json({ csrfToken: result.session.csrfToken });
});

app.get("/api/emails", (req, res) => {
  const result = validateSession(req, res);
  if (!result) return;

  res.json(emails);
});

/*
  TASK 1: Vulnerable delete action via GET
  Active in all modes except csrf-token hardening mode
*/
// app.get("/api/emails/delete/:id", (req, res) => {
//   if (config.mode === "csrf-token") {
//     return res
//       .status(405)
//       .send("Use POST /api/emails/delete with CSRF token in this mode");
//   }

//   const result = validateSession(req, res);
//   if (!result) return;

//   const id = parseInt(req.params.id, 10);
//   const index = emails.findIndex((e) => e.id === id);

//   if (index === -1) {
//     return res.status(404).send("Email not found");
//   }

//   emails.splice(index, 1);
//   res.send(`Email ${id} deleted`);
// });

/*
  TASK 4: Hardened delete action via POST + CSRF token
*/
app.post("/api/emails/delete", (req, res) => {
  if (config.mode !== "csrf-token") {
    return res
      .status(405)
      .send("POST delete is only active in csrf-token mode");
  }

  const result = validateSession(req, res);
  if (!result) return;

  const { id, _csrf_token } = req.body;

  if (!_csrf_token || _csrf_token !== result.session.csrfToken) {
    return res.status(403).send("Forbidden");
  }

  const emailId = parseInt(id, 10);
  const index = emails.findIndex((e) => e.id === emailId);

  if (index === -1) {
    return res.status(404).send("Email not found");
  }

  emails.splice(index, 1);
  res.send(`Email ${emailId} deleted`);
});

app.get("/api/logout", (req, res) => {
  const sessionId = getSessionId(req);

  if (sessionId) {
    delete sessions[sessionId];
    console.log("Session destroyed:", sessionId);
  }

  res.send("Logged out");
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
