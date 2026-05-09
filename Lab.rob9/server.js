const express = require("express");
const path = require("path");

const app = express();
const PORT = 9000;

const bookings = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isRealDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(dateString + "T00:00:00");

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function validateBooking(data) {
  const errors = [];

  const name = String(data.name || "").trim();
  const surname = String(data.surname || "").trim();
  const email = String(data.email || "").trim();
  const ageRaw = String(data.age || "").trim();
  const bookingDate = String(data.bookingDate || "").trim();

  if (!name) errors.push("Name is required.");
  if (!surname) errors.push("Surname is required.");
  if (!email) errors.push("Email is required.");
  if (!ageRaw) errors.push("Age is required.");
  if (!bookingDate) errors.push("Date of Booking is required.");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Email format is invalid.");
  }

  const age = Number(ageRaw);
  if (!Number.isInteger(age) || age < 5 || age > 100) {
    errors.push("Age must be an integer from 5 to 100.");
  }

  if (bookingDate && !isRealDate(bookingDate)) {
    errors.push("Date of Booking must be a real valid date.");
  }

  return {
    errors,
    cleaned: {
      name,
      surname,
      email,
      age,
      bookingDate,
    },
  };
}

app.get("/", (req, res) => {
  res.send(`
    <h1>Lab 9 - Camp Booking Validator</h1>
    <ul>
      <li><a href="/task1">Task 1 - No Validation</a></li>
      <li><a href="/task2">Task 2 / Task 4 - Client + Server Validation</a></li>
    </ul>
    <p>Task 3 endpoint: <code>POST /api/book-basic</code></p>
    <p>Task 4 endpoint: <code>POST /api/book-secure</code></p>
  `);
});

/* Task 1 */
app.get("/task1", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "task1.html"));
});

app.post("/submit-basic", (req, res) => {
  const booking = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    age: req.body.age,
    bookingDate: req.body.bookingDate,
  };

  bookings.push(booking);

  res.send(`
    <h1>Booking received</h1>
    <p><strong>Name:</strong> ${booking.name}</p>
    <p><strong>Surname:</strong> ${booking.surname}</p>
    <p><strong>Email:</strong> ${booking.email}</p>
    <p><strong>Age:</strong> ${booking.age}</p>
    <p><strong>Date of Booking:</strong> ${booking.bookingDate}</p>
    <p><a href="/task1">Back to Task 1</a></p>
    <p><a href="/task2">Back to Task 2</a></p>
  `);
});

/* Task 2 */
app.get("/task2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "task2.html"));
});

/* Task 3 */
app.post("/api/book-basic", (req, res) => {
  const booking = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    age: req.body.age,
    bookingDate: req.body.bookingDate,
  };

  bookings.push(booking);

  res.json({
    message: "Booking accepted without server-side validation",
    booking,
  });
});

/* Task 4 */
app.post("/submit-secure", (req, res) => {
  const { errors, cleaned } = validateBooking(req.body);

  if (errors.length > 0) {
    return res.status(400).send(`
      <h1>400 Bad Request</h1>
      <ul>
        ${errors.map((err) => `<li>${escapeHtml(err)}</li>`).join("")}
      </ul>
      <p><a href="/task2">Back to form</a></p>
    `);
  }

  bookings.push(cleaned);

  res.send(`
    <h1>Booking accepted safely</h1>
    <p><strong>Name:</strong> ${escapeHtml(cleaned.name)}</p>
    <p><strong>Surname:</strong> ${escapeHtml(cleaned.surname)}</p>
    <p><strong>Email:</strong> ${escapeHtml(cleaned.email)}</p>
    <p><strong>Age:</strong> ${escapeHtml(cleaned.age)}</p>
    <p><strong>Date of Booking:</strong> ${escapeHtml(cleaned.bookingDate)}</p>
    <p><a href="/task2">Back to secure form</a></p>
  `);
});

app.post("/api/book-secure", (req, res) => {
  const { errors, cleaned } = validateBooking(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }

  bookings.push(cleaned);

  res.json({
    message: "Booking accepted safely",
    booking: cleaned,
  });
});

app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
