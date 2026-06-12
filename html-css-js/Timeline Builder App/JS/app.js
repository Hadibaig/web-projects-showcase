let timelineEvents = [];
let editingId = null;

const timeline = document.getElementById("timeline");
const form = document.getElementById("timelineForm");

const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category");

function renderTimeline(data = timelineEvents) {

    if (data.length === 0) {
        timeline.innerHTML = `<div class="empty-state">No events found</div>`;
        return;
    }

    timeline.innerHTML = "";

    data
    .sort((a, b) => a.year - b.year)
    .forEach(event => {

        const div = document.createElement("div");
        div.className = "timeline-item";
        div.draggable = true;

        div.innerHTML = `
            <div class="timeline-year">${event.year}</div>
            <div class="timeline-title">${event.title}</div>
            <div>${event.description}</div>
            <small>${event.category}</small>

            <div class="actions">
                <button onclick="editEvent(${event.id})">Edit</button>
                <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;

        /* DRAG START */
        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", event.id);
        });

        timeline.appendChild(div);
    });
}

/* ADD EVENT */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newEvent = {
        id: Date.now(),
        year: document.getElementById("year").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        category: document.getElementById("categoryInput").value
    };

    timelineEvents.push(newEvent);

    form.reset();
    renderTimeline();
});

/* DELETE */
function deleteEvent(id) {
    timelineEvents = timelineEvents.filter(e => e.id !== id);
    renderTimeline();
}

/* EDIT */
function editEvent(id) {
    const item = timelineEvents.find(e => e.id === id);

    document.getElementById("year").value = item.year;
    document.getElementById("title").value = item.title;
    document.getElementById("description").value = item.description;
    document.getElementById("categoryInput").value = item.category;

    editingId = id;
}

/* SEARCH */
function handleSearch(value) {
    const filtered = searchEvents(timelineEvents, value);
    renderTimeline(filtered);
}

/* CATEGORY FILTER */
function handleCategory(value) {
    const filtered = filterByCategory(timelineEvents, value);
    renderTimeline(filtered);
}

/* DRAG DROP SORT (simple swap logic) */
timeline.addEventListener("dragover", (e) => {
    e.preventDefault();
});

timeline.addEventListener("drop", (e) => {
    const draggedId = +e.dataTransfer.getData("text/plain");

    const target = timelineEvents.find(e => e.id == draggedId);
    timelineEvents = timelineEvents.filter(e => e.id !== draggedId);

    timelineEvents.push(target);

    renderTimeline();
});

renderTimeline();