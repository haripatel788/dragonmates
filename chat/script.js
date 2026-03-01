document.addEventListener('DOMContentLoaded', async () => {
    const chatBox = document.getElementById('chat-box');
    const statusEl = document.getElementById('chat-status');
    const inputEl = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const roommateNameEl = document.getElementById('roommate-name');

    let headers = null;
    let pairId = null;
    let myUserId = null;
    let pollHandle = null;

    const setStatus = (msg, show = true) => {
        if (!statusEl) return;
        statusEl.textContent = msg || '';
        statusEl.classList.toggle('hidden', !show);
    };

    const formatTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const makeBubble = (msg, isMine) => {
        const div = document.createElement('div');
        div.className = `bubble ${isMine ? 'mine' : 'theirs'}`;
        div.textContent = msg.messageText || '';

        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = formatTime(msg.createdAt);
        div.appendChild(meta);

        return div;
    };

    const getAuthHeaders = async () => {
        if (window.Clerk?.load) {
            await window.Clerk.load();
        }
        if (!window.Clerk?.user && !localStorage.getItem('token')) {
            window.location.href = '/auth/login';
            return null;
        }
        let token = await window.Clerk?.session?.getToken();
        if (!token) token = localStorage.getItem('token');
        if (token === 'null' || token === 'undefined') token = null;
        if (!token) return null;
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    const loadMessages = async () => {
        if (!pairId || !headers) return;
        const res = await fetch(`/api/chat/${pairId}`, { headers });
        if (!res.ok) {
            setStatus('Unable to load messages.');
            return;
        }

        const data = await res.json();
        chatBox.innerHTML = '';
        (data.messages || []).forEach((msg) => {
            const mine = String(msg.senderId) === String(myUserId);
            chatBox.appendChild(makeBubble(msg, mine));
        });
        chatBox.scrollTop = chatBox.scrollHeight;
        setStatus('', false);
    };

    const sendMessage = async () => {
        const text = inputEl.value.trim();
        if (!text || !pairId || !headers) return;

        sendButton.disabled = true;
        try {
            const res = await fetch(`/api/chat/${pairId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setStatus(errData.error || 'Failed to send message.');
                return;
            }
            inputEl.value = '';
            await loadMessages();
        } finally {
            sendButton.disabled = false;
        }
    };

    const init = async () => {
        headers = await getAuthHeaders();
        if (!headers) {
            setStatus('Missing authentication token.');
            return;
        }

        const meRes = await fetch('/api/me', { headers });
        if (!meRes.ok) {
            setStatus('Unable to resolve your account. Please revisit Preferences first.');
            return;
        }
        const me = await meRes.json();
        myUserId = me.id;

        const roommateRes = await fetch('/api/my-roommate', { headers });
        if (!roommateRes.ok) {
            setStatus('Unable to load roommate assignment.');
            return;
        }
        const roommateData = await roommateRes.json();
        if (!roommateData.roommate) {
            setStatus('No guaranteed roommate yet. Chat unlocks once you are paired.');
            inputEl.disabled = true;
            sendButton.disabled = true;
            return;
        }

        pairId = roommateData.roommate.pairId;
        const name = roommateData.roommate.roommateEmail?.split('@')[0] || 'Roommate';
        roommateNameEl.textContent = `Chat with ${name}`;

        await loadMessages();
        pollHandle = setInterval(loadMessages, 3000);
    };

    sendButton.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (pollHandle) clearInterval(pollHandle);
    });

    init();
});
