document.addEventListener('DOMContentLoaded', async () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    let pairId = null;

    const res = await fetch('/api/my-roommate', { headers: authHeaders });
    const data = await res.json();
    if (data.roommate) {
        pairId = data.roommate.pairId;
        setInterval(loadMessages, 1000);
    }

    async function loadMessages() {
        if (!pairId) return;
        const res = await fetch(`/api/chat/${pairId}`, { headers: authHeaders });
        const { messages } = await res.json();
        
        chatBox.innerHTML = messages.map(msg => `
            <div class="message ${msg.senderId === myId ? 'sent-message' : 'received-message'}">
                ${msg.messageText}
            </div>
        `).join('');
        
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendButton.onclick = async () => {
        const text = messageInput.value;
        await fetch(`/api/chat/${pairId}`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ text })
        });
        messageInput.value = '';
        loadMessages(); 
    };
});