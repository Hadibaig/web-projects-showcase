function exportJSON(data) {
    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline-data.json";
    a.click();

    URL.revokeObjectURL(url);
}

/* IMPORT JSON */
function importJSON(file, callback) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = JSON.parse(e.target.result);
        callback(data);
    };

    reader.readAsText(file);
}