async function savePreferences() {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const prefs = {
        sleepSchedule: getVal("sleepSchedule"),
        cleanliness: getVal("cleanliness"),
        noiseLevel: getVal("noise"),
        guestsFrequency: getVal("guests"),
        pets: getVal("pets")
    };

    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
    const user = window.Clerk?.user || null;
    const hasLegacyToken = Boolean(localStorage.getItem('token'));
    if (!user && !hasLegacyToken) {
        alert('Please sign in first.');
        return;
    }

    try {
        let token = await window.Clerk?.session?.getToken();
        if (!token) token = localStorage.getItem('token');
        if (token === 'null' || token === 'undefined') token = null;
        if (!token) throw new Error('Missing session token');

        const res = await fetch('/api/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
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
        
        const profileDisplay = document.getElementById("profileDisplay");
        if (profileDisplay) profileDisplay.innerHTML = "Preferences saved to database!";
    } catch (err) {
        console.error('Error saving preferences:', err);
        const profileDisplay = document.getElementById("profileDisplay");
        if (profileDisplay) profileDisplay.innerHTML = "Error: " + err.message;
    }
}

function loadSaved() {
    try {
        const prefs = JSON.parse(localStorage.getItem("roommatePrefs") || '{}');
        if (prefs.sleepSchedule) document.getElementById("sleepSchedule").value = prefs.sleepSchedule;
        if (prefs.cleanliness) document.getElementById("cleanliness").value = prefs.cleanliness;
        if (prefs.noiseLevel) document.getElementById("noise").value = prefs.noiseLevel;
        if (prefs.guestsFrequency) document.getElementById("guests").value = prefs.guestsFrequency;
        if (prefs.pets) document.getElementById("pets").value = prefs.pets;
    } catch (err) {
        console.error('Failed to load saved preferences', err);
    }
}
