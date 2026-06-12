let timelineEvents = [
  {
    id: 1,
    year: "2020",
    title: "Company Founded",
    description: "Started the journey."
  },
  {
    id: 2,
    year: "2021",
    title: "First Product",
    description: "Launched MVP."
  }
];

let editingId = null;

const timeline = document.getElementById("timeline");
const form = document.getElementById("timelineForm");
const submitBtn = document.getElementById("submitBtn");

function renderTimeline() {
  if (timelineEvents.length === 0) {
    timeline.innerHTML = `<p class="empty-state">No events yet</p>`;
    return;
  }

  timeline.innerHTML = "";

  timelineEvents
    .sort((a, b) => a.year - b.year)
    .forEach(event => {
      const div = document.createElement("div");
      div.className = "timeline-item";

      div.innerHTML = `
        <div class="timeline-year">${event.year}</div>
        <div class="timeline-title">${event.title}</div>
        <div>${event.description}</div>

        <div class="actions">
          <button class="edit-btn" onclick="editEvent(${event.id})">Edit</button>
          <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
        </div>
      `;

      timeline.appendChild(div);
    });
}

/* ADD / UPDATE */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const year = document.getElementById("year").value;
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  if (editingId) {
    const item = timelineEvents.find(e => e.id === editingId);
    item.year = year;
    item.title = title;
    item.description = description;

    editingId = null;
    submitBtn.textContent = "Add Event";

  } else {
    timelineEvents.push({
      id: Date.now(),
      year,
      title,
      description
    });
  }

  form.reset();
  renderTimeline();
});

/* EDIT */
function editEvent(id) {
  const item = timelineEvents.find(e => e.id === id);

  document.getElementById("year").value = item.year;
  document.getElementById("title").value = item.title;
  document.getElementById("description").value = item.description;

  editingId = id;
  submitBtn.textContent = "Update Event";
}

/* DELETE */
function deleteEvent(id) {
  timelineEvents = timelineEvents.filter(e => e.id !== id);
  renderTimeline();
}

/* THEME */
function changeTheme(theme) {
  applyTheme(theme);
}

/* LAYOUT */
function changeLayout(layout) {
  applyLayout(layout);
}

renderTimeline();