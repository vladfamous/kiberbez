document.cookie = "SessionID=123456";

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
