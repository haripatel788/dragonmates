async function savePreferences() {
    const prefs = {
        sleepSchedule: document.getElementById("sleepSchedule").value,
        cleanliness: document.getElementById("cleanliness").value,
        noiseLevel: document.getElementById("noise").value,
        guestsFrequency: document.getElementById("guests").value,
        pets: document.getElementById("pets").value
    };

    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
    const user = window.Clerk?.user;
    if (!user) {
        alert('Please sign in first.');
        return;
    }

    try {
        const res = await fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clerkId: user.id,
                scores: {
                    sleepSchedule: prefs.sleepSchedule,
                    cleanliness: prefs.cleanliness,
                    noiseTolerance: prefs.noiseLevel,
                    guestsFrequency: prefs.guestsFrequency,
                    pets: prefs.pets
                }
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to save');
        }
        
        document.getElementById("profileDisplay").innerHTML = "Preferences saved to database!";
    } catch (err) {
        console.error('Error saving preferences:', err);
        document.getElementById("profileDisplay").innerHTML = "Error: " + err.message;
    }
}