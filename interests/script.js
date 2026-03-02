const STORAGE_KEY = 'roommatePrefs';

const SCORE_KEYS = [
    'cleanliness', 'sleepSchedule', 'noiseTolerance', 'guestsFrequency',
    'cookingHabits', 'timeAtHome', 'temperaturePref', 'gymInterest', 'mediaInterest'
];

function initStars() {
    document.querySelectorAll('.star-rating').forEach(ratingEl => {
        const key = ratingEl.dataset.key;
        ratingEl.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => setStar(key, parseInt(star.dataset.value, 10)));
            star.addEventListener('mouseenter', () => highlightStars(ratingEl, parseInt(star.dataset.value, 10)));
            star.addEventListener('mouseleave', () => showSavedStars(ratingEl, key));
        });
    });
}

function setStar(key, value) {
    const prefs = getPrefs();
    if (!prefs.scores) prefs.scores = {};
    prefs.scores[key] = value;
    savePrefs(prefs);
    showSavedStars(document.querySelector(`[data-key="${key}"]`), key);
}

function highlightStars(ratingEl, upTo) {
    if (!ratingEl) return;
    ratingEl.querySelectorAll('.star').forEach((star, i) => {
        const v = parseInt(star.dataset.value, 10);
        star.classList.toggle('text-drexel-gold', v <= upTo);
        star.classList.toggle('text-gray-300', v > upTo);
    });
}

function showSavedStars(ratingEl, key) {
    if (!ratingEl) return;
    const prefs = getPrefs();
    const val = prefs.scores && prefs.scores[key] ? prefs.scores[key] : 0;
    highlightStars(ratingEl, val);
}

function getPrefs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

async function getAuthHeaders() {
    let token = null;
    try {
        token = await window.Clerk?.session?.getToken();
    } catch (_) {
        // ignore
    }
    if (!token) token = localStorage.getItem('token');
    if (token === 'null' || token === 'undefined') token = null;
    if (!token) throw new Error('Missing authentication token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function collectFormData() {
    const prefs = getPrefs();

    prefs.dealbreakers = {
        smoking: document.getElementById('smoking')?.value || '',
        pets: document.getElementById('pets')?.value || '',
        budgetMin: document.getElementById('budgetMin')?.value || '',
        budgetMax: document.getElementById('budgetMax')?.value || '',
        moveInDate: document.getElementById('moveInDate')?.value || '',
        coopCycle: document.getElementById('coopCycle')?.value || '',
        leaseLength: document.getElementById('leaseLength')?.value || '',
        genderPref: document.getElementById('genderPref')?.value || '',
        roomType: document.getElementById('roomType')?.value || ''
    };

    // Scores (1-5)
    if (!prefs.scores) prefs.scores = {};
    SCORE_KEYS.forEach(key => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el && prefs.scores[key]) {
            // already in prefs from star clicks
        } else if (!prefs.scores[key]) {
            prefs.scores[key] = 0;
        }
    });

    prefs.personal = {
        major: document.getElementById('major')?.value || '',
        year: document.getElementById('year')?.value || '',
        hobbies: [...document.querySelectorAll('input[name="hobbies"]:checked')].map(cb => cb.value),
        personality: document.getElementById('personality')?.value || ''
    };

    return prefs;
}

function loadFormData() {
    const prefs = getPrefs();

    const db = prefs.dealbreakers || {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('smoking', db.smoking);
    setVal('pets', db.pets);
    setVal('budgetMin', db.budgetMin);
    setVal('budgetMax', db.budgetMax);
    setVal('moveInDate', db.moveInDate);
    setVal('coopCycle', db.coopCycle);
    setVal('leaseLength', db.leaseLength);
    setVal('genderPref', db.genderPref);
    setVal('roomType', db.roomType);

    const p = prefs.personal || {};
    setVal('major', p.major);
    setVal('year', p.year);
    setVal('personality', p.personality);
    (p.hobbies || []).forEach(h => {
        const cb = document.querySelector(`input[name="hobbies"][value="${h}"]`);
        if (cb) cb.checked = true;
    });

    SCORE_KEYS.forEach(key => {
        const ratingEl = document.querySelector(`[data-key="${key}"]`);
        showSavedStars(ratingEl, key);
    });
}

async function savePreferences() {
    const prefs = collectFormData();
    savePrefs(prefs);

    const msg = document.getElementById('saveMessage');
    const hasLegacyToken = Boolean(localStorage.getItem('token'));
    const user = window.Clerk?.user || null;
    if (!user && !hasLegacyToken) {
        alert('Please sign in first.');
        return;
    }

    try {
        const headers = await getAuthHeaders();

        // Save dealbreakers
        const dealRes = await fetch('/api/dealbreakers', {
            method: 'POST',
            headers,
            body: JSON.stringify(prefs.dealbreakers)
        });
        if (!dealRes.ok) {
            const errData = await dealRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to save dealbreakers');
        }

        if (msg) {
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
    } catch (err) {
        console.error('Error saving preferences:', err);
        alert(`Failed to save: ${err.message}`);
    }
}
function goBack() {
    window.history.back();
}

function signOut() {
    localStorage.removeItem('roommatePrefs');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.Clerk?.signOut) {
        window.Clerk.signOut().then(() => {
            window.location.href = '/';
        });
    } else {
        window.location.href = '/';
    }
}

// Init
initStars();
loadFormData();
