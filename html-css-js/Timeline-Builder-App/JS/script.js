let editingId = null;

const timelineEvents = [
{
    id:1,
    year:"2020",
    title:"Company Founded",
    description:"Business officially launched."
},
{
    id:2,
    year:"2022",
    title:"Funding Round",
    description:"Secured first investment."
}
];

const timeline = document.getElementById("timeline");
const form = document.getElementById("timelineForm");
const submitBtn = document.getElementById("submitBtn");

function renderTimeline(){

    if(timelineEvents.length === 0){

        timeline.innerHTML = `
            <div class="empty-state">
                <h2>📅</h2>
                <p>No events yet</p>
                <small>Create your first milestone</small>
            </div>
        `;

        return;
    }

    timeline.innerHTML = "";

    timelineEvents
    .sort((a,b)=>a.year-b.year)
    .forEach(event=>{

        timeline.innerHTML += `
            <div class="timeline-item">

                <div class="timeline-year">
                    ${event.year}
                </div>

                <div class="timeline-title">
                    ${event.title}
                </div>

                <div>
                    ${event.description}
                </div>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editEvent(${event.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteEvent(${event.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;
    });
}

form.addEventListener("submit", function(e){

    e.preventDefault();

    const year = document.getElementById("year").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    if(editingId){

        const event = timelineEvents.find(
            item => item.id === editingId
        );

        event.year = year;
        event.title = title;
        event.description = description;

        editingId = null;

        submitBtn.textContent = "Add Event";

        showNotification("Event Updated");

    }else{

        timelineEvents.push({
            id:Date.now(),
            year,
            title,
            description
        });

        showNotification("Event Added");
    }

    form.reset();

    renderTimeline();
});

function editEvent(id){

    const event = timelineEvents.find(
        item => item.id === id
    );

    document.getElementById("year").value =
        event.year;

    document.getElementById("title").value =
        event.title;

    document.getElementById("description").value =
        event.description;

    editingId = id;

    submitBtn.textContent = "Update Event";
}

function deleteEvent(id){

    const index = timelineEvents.findIndex(
        item => item.id === id
    );

    timelineEvents.splice(index,1);

    renderTimeline();

    showNotification("Event Deleted");
}

function changeTheme(theme){

    document.body.className = theme;
}

function changeLayout(layout){

    timeline.className = `timeline ${layout}`;
}

function showNotification(message){

    const notification =
        document.getElementById("notification");

    notification.textContent = message;

    notification.style.display = "block";

    setTimeout(()=>{

        notification.style.display = "none";

    },3000);
}

renderTimeline();