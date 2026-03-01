function goBack() {
    window.history.back();
}

function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function sendMessage() {
    window.location.href = '/chat';
}

function saveProfile() {
    alert('Profile saved!');
}
