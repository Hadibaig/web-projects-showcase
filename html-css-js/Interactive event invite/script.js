// Get the RSVP form from the page
const rsvpForm = document.getElementById("rsvp-form");

// Get the confirmation message area
const confirmationMessage = document.getElementById("confirmation-message");

// Listen for form submissions
rsvpForm.addEventListener("submit", function (event) {

    // Prevent the page from refreshing
    event.preventDefault();

    // Get the value entered in the attendance field
    const attendance = document
        .getElementById("attendance")
        .value
        .trim()
        .toLowerCase();

    // Check if the user is attending
    if (attendance === "Yes") {

        // Show a positive confirmation message
        confirmationMessage.innerHTML =
            "🎉 Awesome! Your RSVP has been received. We can't wait to see you at the GIF Gala!";

    } else {

        // Show an alternative message
        confirmationMessage.innerHTML =
            "😊 Thanks for letting us know. We'll miss you at the GIF Gala!";

    }

    // Make the confirmation message visible
    confirmationMessage.style.display = "block";
});