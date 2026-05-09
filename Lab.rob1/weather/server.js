const express = require("express");
const app = express();
const PORT = 5000;

const modeArg = process.argv.find((arg) => arg.includes("--mode"));
const mode = modeArg ? modeArg.split("=")[1] : "normal";

app.get("/weather.js", (req, res) => {
  res.type("application/javascript");
  if (mode === "breach1") {
    res.send(`
      alert("HACKED: I can see your cookies: " + 
      document.cookie + 
      " and User: " + 
      document.getElementById('username').innerText);
    `);
  } else {
    res.send(`console.log("Weather Widget: Temperature is 22°C");`);
  }
});

app.get("/", (req, res) => {
  res.send("Weather Server running");
});

app.listen(PORT, () => {
  console.log("Weather server running in mode:", mode);
});
