let csrfToken = null;

function login() {
  const user = document.getElementById("username").value;

  fetch(`/login?user=${encodeURIComponent(user)}`, {
    credentials: "same-origin",
  })
    .then((res) => {
      const type = res.headers.get("content-type");

      if (type && type.includes("application/json")) {
        return res.json();
      }

      return res.text();
    })
    .then((data) => {
      if (typeof data === "object") {
        csrfToken = data.csrfToken || null;
        document.getElementById("status").innerText =
          data.message || "Logged in";
      } else {
        csrfToken = null;
        document.getElementById("status").innerText = data;
      }

      loadEmails();
    })
    .catch(() => {
      document.getElementById("status").innerText = "Login failed";
    });
}

function logout() {
  fetch("/api/logout", {
    credentials: "same-origin",
  }).then(() => {
    csrfToken = null;
    document.cookie =
      "SessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
  });
}

function deleteEmail(id) {
  if (csrfToken) {
    fetch("/api/emails/delete", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        _csrf_token: csrfToken,
      }),
    })
      .then((res) => res.text())
      .then((message) => {
        document.getElementById("status").innerText = message;
        loadEmails();
        clearContentIfDeleted(id);
      })
      .catch(() => {
        document.getElementById("status").innerText = "Delete failed";
      });
  } else {
    fetch(`/api/emails/delete/${id}`, {
      method: "GET",
      credentials: "same-origin",
    })
      .then((res) => res.text())
      .then((message) => {
        document.getElementById("status").innerText = message;
        loadEmails();
        clearContentIfDeleted(id);
      })
      .catch(() => {
        document.getElementById("status").innerText = "Delete failed";
      });
  }
}

function clearContentIfDeleted(id) {
  const content = document.getElementById("content");
  const selectedId = content.getAttribute("data-email-id");

  if (selectedId && Number(selectedId) === id) {
    content.removeAttribute("data-email-id");
    content.innerHTML = "<p>Email deleted.</p>";
  }
}

function renderEmailList(data) {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");

  sidebar.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    sidebar.innerHTML = "<p>No emails</p>";
    if (!content.innerHTML.trim()) {
      content.innerHTML = "<p>No email selected</p>";
    }
    return;
  }

  data.forEach((email) => {
    const item = document.createElement("div");
    item.style.padding = "8px";
    item.style.marginBottom = "6px";
    item.style.borderBottom = "1px solid #ccc";

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <span style="cursor:pointer; font-size:20px; flex:1;">${email.subject}</span>
        <button onclick="deleteEmail(${email.id})">Delete</button>
      </div>
    `;

    item.querySelector("span").onclick = () => {
      content.setAttribute("data-email-id", email.id);
      content.innerHTML = `
        <h3>${email.subject}</h3>
        <p><strong>From:</strong> ${email.sender}</p>
        <p>${email.body}</p>
      `;
    };

    sidebar.appendChild(item);
  });
}

function loadEmails() {
  fetch("/api/emails", {
    credentials: "same-origin",
  })
    .then((response) => {
      if (response.status === 401) {
        document.getElementById("status").innerText = "Not authorized";
        renderEmailList([]);
        return null;
      }

      return response.json();
    })
    .then((data) => {
      if (data) {
        renderEmailList(data);
      }
    })
    .catch(() => {
      document.getElementById("status").innerText = "Failed to load emails";
    });
}

loadEmails();
