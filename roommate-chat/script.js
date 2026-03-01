document.addEventListener('DOMContentLoaded', async () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const roommateNameEl = document.getElementById('roommate-name');

    let pairId = null;
    let myUserId = null;
    let headers = null;

    async function makeAuthHeaders() {
        await window.Clerk.load();
        if (!window.Clerk.user && !localStorage.getItem('token')) {
            window.location.href = '/auth/login';
            return null;
        }
        let token = await window.Clerk.session?.getToken();
        if (!token) token = localStorage.getItem('token');
        if (!token) return null;
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }

    function showEmptyState(msg) {
        roommateNameEl.innerText = msg;
        chatBox.innerHTML = `<div class="text-sm text-gray-500">${msg}</div>`;
    }

    async function init() {
        headers = await makeAuthHeaders();
        if (!headers) return;

        const meRes = await fetch('/api/me', { headers });
        if (!meRes.ok) {
            showEmptyState('Unable to load your session.');
            return;
        }
        const meData = await meRes.json();
        myUserId = meData.id;

        const res = await fetch('/api/my-roommate', { headers });
        if (!res.ok) {
            showEmptyState('Unable to load roommate.');
            return;
        }
        const data = await res.json();

        if (!data.roommate) {
            showEmptyState('No guaranteed roommate yet.');
            return;
        }

        pairId = data.roommate.pairId;
        roommateNameEl.innerText = data.roommate.roommateEmail.split('@')[0];
        await loadMessages();
        setInterval(loadMessages, 3000);
    }

    async function loadMessages() {
        if (!pairId || !headers) return;
        const res = await fetch(`/api/chat/${pairId}`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        
        chatBox.innerHTML = '';
        data.messages.forEach(msg => {
            const div = document.createElement('div');
            const isMine = msg.senderId === myUserId;
            div.className = `p-3 max-w-[70%] ${isMine ? 'sent-message' : 'received-message'}`;
            div.innerText = msg.messageText;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendButton.addEventListener('click', async () => {
        if (!pairId || !headers) return;
        const text = messageInput.value.trim();
        if (!text) return;
        
        const res = await fetch(`/api/chat/${pairId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text })
        });
        if (!res.ok) return;
        messageInput.value = '';
        loadMessages();
    });

    init();
});
