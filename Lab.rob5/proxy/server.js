const express = require("express");
const http = require("http");

const app = express();
const PORT = 8080;

const modeArg = process.argv.find((arg) => arg.includes("--mode"));
const mode = modeArg ? modeArg.split("=")[1] : "normal";

console.log("Proxy mode:", mode);

app.use((req, res) => {
  if (mode === "breach") {
    console.log("Intercepted Cookie:", req.headers.cookie);
  }

  const options = {
    hostname: "localhost",
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy error");
  });

  req.pipe(proxyReq, { end: true });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
