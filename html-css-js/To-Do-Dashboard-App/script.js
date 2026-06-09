let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let selectedColor = "#fff9c4";
let editIndex = null;

const modal = document.getElementById("taskModal");
const taskList = document.getElementById("taskList");

const title = document.getElementById("taskTitle");
const desc = document.getElementById("taskDesc");
const date = document.getElementById("taskDate");

// ---------------- NAV ----------------
document.getElementById("homeBtn").onclick = () => {
  document.getElementById("homeView").classList.remove("hidden");
  document.getElementById("aboutView").classList.add("hidden");
  document.getElementById("taskDetail").classList.add("hidden");
};

document.getElementById("aboutBtn").onclick = () => {
  document.getElementById("aboutView").classList.remove("hidden");
  document.getElementById("homeView").classList.add("hidden");
  document.getElementById("taskDetail").classList.add("hidden");
};

// ---------------- ADD TASK ----------------
document.getElementById("addTaskBtn").onclick = () => {

  editIndex = null;

  title.value = "";
  desc.value = "";
  date.value = "";
  selectedColor = "#fff9c4";

  modal.classList.remove("hidden");
};

// ---------------- CLOSE MODAL ----------------
document.getElementById("closeModalBtn").onclick = () => {
  modal.classList.add("hidden");
};

// ---------------- COLOR SELECT ----------------
document.querySelectorAll(".c").forEach(c => {
  c.onclick = () => {
    selectedColor = c.getAttribute("data");
  };
});

// ---------------- SAVE TASK (VALIDATION FIXED) ----------------
document.getElementById("saveTaskBtn").onclick = () => {

  // ✅ REQUIRED VALIDATION (IMPORTANT FIX)
  if (!title.value.trim()) {
    alert("Task title is required!");
    return;
  }

  const task = {
    title: title.value.trim(),
    desc: desc.value.trim(),
    date: date.value,
    color: selectedColor
  };

  if (editIndex !== null) {
    tasks[editIndex] = task;
  } else {
    tasks.push(task);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  modal.classList.add("hidden");
  render();
};

// ---------------- RENDER ----------------
function render() {
  taskList.innerHTML = "";

  tasks.forEach((t, i) => {

    const div = document.createElement("div");
    div.className = "task";
    div.style.background = t.color;

    div.innerHTML = `<b>${t.title}</b><br><small>${t.date}</small>`;

    div.onclick = () => show(i);

    taskList.appendChild(div);
  });
}

// ---------------- SHOW DETAIL ----------------
function show(i) {
  const t = tasks[i];

  document.getElementById("taskDetail").classList.remove("hidden");

  document.getElementById("detailTitle").innerText = t.title;
  document.getElementById("detailDesc").innerText = t.desc;
  document.getElementById("detailDate").innerText = t.date;
  document.getElementById("detailColor").style.background = t.color;

  document.getElementById("deleteTaskBtn").onclick = () => {
    tasks.splice(i, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    render();

    document.getElementById("taskDetail").classList.add("hidden");
    document.getElementById("homeView").classList.remove("hidden");
  };

  document.getElementById("editTaskBtn").onclick = () => {

    editIndex = i;

    title.value = t.title;
    desc.value = t.desc;
    date.value = t.date;
    selectedColor = t.color;

    modal.classList.remove("hidden");
  };
}

render();