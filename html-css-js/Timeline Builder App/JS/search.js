function searchEvents(events, query) {
    return events.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.year.includes(query) ||
        event.description.toLowerCase().includes(query.toLowerCase())
    );
}

function filterByCategory(events, category) {
    if (category === "all") return events;
    return events.filter(e => e.category === category);
}