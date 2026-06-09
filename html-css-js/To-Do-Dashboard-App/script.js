let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let selectedColor = "#fff9c4";
let editIndex = null;

// ELEMENTS
const taskList = document.getElementById("taskList");

const modal = document.getElementById("taskModal");
const limitModal = document.getElementById("limitModal");

const titleInput = document.getElementById("taskTitle");
const descInput = document.getElementById("taskDesc");
const dateInput = document.getElementById("taskDate");

// DETAIL
const detailTitle = document.getElementById("detailTitle");
const detailDesc = document.getElementById("detailDesc");
const detailDate = document.getElementById("detailDate");
const detailColor = document.getElementById("detailColor");

const homeView = document.getElementById("homeView");
const aboutView = document.getElementById("aboutView");
const detailView = document.getElementById("taskDetail");

// NAV
document.getElementById("homeBtn").onclick = () => {
  homeView.classList.remove("hidden");
  aboutView.classList.add("hidden");
  detailView.classList.add("hidden");
};

document.getElementById("aboutBtn").onclick = () => {
  aboutView.classList.remove("hidden");
  homeView.classList.add("hidden");
  detailView.classList.add("hidden");
};

// OPEN ADD TASK
document.getElementById("addTaskBtn").onclick = () => {

  if (tasks.length >= 7) {
    limitModal.classList.remove("hidden");
    return;
  }

  editIndex = null;
  titleInput.value = "";
  descInput.value = "";
  dateInput.value = "";

  modal.classList.remove("hidden");
};

// CLOSE MODAL
document.getElementById("closeModalBtn").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("closeLimitModal").onclick = () => {
  limitModal.classList.add("hidden");
};

// COLOR SELECT
document.querySelectorAll(".color").forEach(c => {
  c.onclick = () => {
    document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));
    c.classList.add("selected");
    selectedColor = c.dataset.color;
  };
});

// SAVE TASK
document.getElementById("saveTaskBtn").onclick = () => {

  const task = {
    title: titleInput.value,
    description: descInput.value,
    date: dateInput.value,
    color: selectedColor
  };

  if (editIndex !== null) {
    tasks[editIndex] = task;
  } else {
    tasks.push(task);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  modal.classList.add("hidden");
  renderTasks();
};

// RENDER SIDEBAR
function renderTasks() {
  taskList.innerHTML = "";

  tasks.slice(0, 7).forEach((task, index) => {

    const div = document.createElement("div");
    div.className = "task-card";
    div.style.background = task.color;

    div.innerHTML = `
      <strong>${task.title}</strong>
      <small>${task.date}</small>
    `;

    div.onclick = () => showTask(index);

    taskList.appendChild(div);
  });
}

// SHOW TASK
function showTask(index) {

  const task = tasks[index];

  homeView.classList.add("hidden");
  aboutView.classList.add("hidden");
  detailView.classList.remove("hidden");

  detailTitle.innerText = task.title;
  detailDesc.innerText = task.description;
  detailDate.innerText = task.date;
  detailColor.style.background = task.color;

  document.getElementById("deleteTaskBtn").onclick = () => {
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    detailView.classList.add("hidden");
    homeView.classList.remove("hidden");
  };

  document.getElementById("editTaskBtn").onclick = () => {
    editIndex = index;

    titleInput.value = task.title;
    descInput.value = task.description;
    dateInput.value = task.date;
    selectedColor = task.color;

    modal.classList.remove("hidden");
  };
}

// INIT
renderTasks();