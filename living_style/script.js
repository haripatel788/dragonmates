function savePreferences() {
    const prefs = {
        sleepSchedule: document.getElementById("sleepSchedule").value,
        cleanliness: document.getElementById("cleanliness").value,
        noise: document.getElementById("noise").value,
        guests: document.getElementById("guests").value,
        pets: document.getElementById("pets").value,
        interests: document.getElementById("interests").value.split(",").map(i => i.trim())
    };

    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
    document.getElementById("profileDisplay").innerHTML = "Preferences saved!";
}

function loadPreferences() {
    const saved = JSON.parse(localStorage.getItem("roommatePrefs"));

    if (!saved) {
        document.getElementById("profileDisplay").innerHTML = "No saved preferences.";
        return;
    }

    // fill form
    document.getElementById("sleepSchedule").value = saved.sleepSchedule;
    document.getElementById("cleanliness").value = saved.cleanliness;
    document.getElementById("noise").value = saved.noise;
    document.getElementById("guests").value = saved.guests;
    document.getElementById("pets").value = saved.pets;
    document.getElementById("interests").value = saved.interests.join(", ");

    // show saved profile
    document.getElementById("profileDisplay").innerHTML = `
        <strong>Sleep:</strong> ${saved.sleepSchedule} <br>
        <strong>Cleanliness:</strong> ${saved.cleanliness} <br>
        <strong>Noise:</strong> ${saved.noise} <br>
        <strong>Guests:</strong> ${saved.guests} <br>
        <strong>Pets:</strong> ${saved.pets} <br>
        <strong>Interests:</strong> ${saved.interests.join(", ")}
    `;

    // basic matching stub
    const score = Math.floor(Math.random() * 40) + 60; // random 60–100%
    document.getElementById("matchResult").innerHTML = 
        `Match Score: <strong>${score}%</strong> (stub example)`;
}
