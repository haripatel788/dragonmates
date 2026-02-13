function goBack() {
    window.history.back();
}

function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function sendMessage() {
    alert('Message feature coming soon!');
}

function saveProfile() {
    alert('Profile saved!');
}