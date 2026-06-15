let timelineEvents = loadData();
let historyStack = [];

const timeline = document.getElementById("timeline");
const form = document.getElementById("timelineForm");

function pushHistory() {
    historyStack.push(JSON.stringify(timelineEvents));
}

/* SAVE */
function persist() {
    saveData(timelineEvents);
}

/* RENDER */
function renderTimeline(data = timelineEvents) {

    timeline.innerHTML = "";

    if (data.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <h3>No Events</h3>
                <p>Add your first timeline event</p>
            </div>
        `;
        return;
    }

    data.sort((a, b) => a.year - b.year);

    data.forEach(event => {
        const div = document.createElement("div");
        div.className = "timeline-item";

        div.innerHTML = `
            <div class="timeline-year">${event.year}</div>
            <div class="timeline-title">${event.title}</div>
            <div>${event.description}</div>

            <small>${event.category || "General"}</small>

            <div class="actions">
                <button onclick="editEvent(${event.id})">Edit</button>
                <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;

        timeline.appendChild(div);
    });
}

/* ADD + UPDATE */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    pushHistory();

    const newEvent = {
        id: Date.now(),
        year: document.getElementById("year").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        category: document.getElementById("categoryInput").value
    };

    timelineEvents.push(newEvent);

    persist();
    renderTimeline();
    form.reset();

    showStatus("Event Saved ✔");
});

/* DELETE */
function deleteEvent(id) {
    pushHistory();

    timelineEvents = timelineEvents.filter(e => e.id !== id);

    persist();
    renderTimeline();

    showStatus("Deleted ✔");
}

/* EDIT */
function editEvent(id) {
    const item = timelineEvents.find(e => e.id === id);

    document.getElementById("year").value = item.year;
    document.getElementById("title").value = item.title;
    document.getElementById("description").value = item.description;
    document.getElementById("categoryInput").value = item.category;
}

/* UNDO */
function undo() {
    if (historyStack.length === 0) return;

    timelineEvents = JSON.parse(historyStack.pop());

    persist();
    renderTimeline();

    showStatus("Undo Done ↶");
}

/* CLEAR ALL */
function clearAll() {
    pushHistory();

    timelineEvents = [];

    persist();
    renderTimeline();

    showStatus("All Cleared");
}

/* IMPORT */
function handleImport(event) {
    importJSON(event.target.files[0], (data) => {
        pushHistory();

        timelineEvents = data;

        persist();
        renderTimeline();

        showStatus("Imported ✔");
    });
}

/* EXPORT */
function handleExport() {
    exportJSON(timelineEvents);
}

/* STATUS */
function showStatus(msg) {
    console.log(msg);
}

renderTimeline();