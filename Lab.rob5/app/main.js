function login() {
  const user = document.getElementById("username").value;

  fetch(`/login?user=${user}`)
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("status").innerText = data;
    });
}

fetch("/api/emails")
  .then((response) => response.json())
  .then((data) => {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    data.forEach((email) => {
      const item = document.createElement("div");
      item.innerText = email.subject;
      item.style.cursor = "pointer";
      item.style.padding = "5px";
      item.style.fontSize = "20px";

      item.onclick = () => {
        content.innerHTML = `
          <h3>${email.subject}</h3>
          <p><strong>From:</strong> ${email.sender}</p>
          <p>${email.body}</p>
        `;
      };

      sidebar.appendChild(item);
    });
  });
