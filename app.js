const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  const li = document.createElement("li");
  li.textContent = value;

  const del = document.createElement("button");
  del.textContent = "x";
  del.onclick = () => li.remove();

  li.appendChild(del);
  list.appendChild(li);

  input.value = "";
});
