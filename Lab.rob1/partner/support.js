const button = document.createElement("button");
button.innerText = "Chat with Support";

button.style.position = "fixed";
button.style.bottom = "20px";
button.style.right = "20px";
button.style.padding = "10px";
button.style.backgroundColor = " rgba(73, 68, 68, 0.281)";
button.style.color = "white";
button.style.border = "100px";
button.style.cursor = "pointer";

document.body.appendChild(button);

button.onclick = () => {
  fetch("http://localhost:4000/api/support")
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
    });
};
