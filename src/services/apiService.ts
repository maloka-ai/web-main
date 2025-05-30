const API_BASE = 'http://localhost:5000'; // ajuste conforme o host/backend

export async function createConversation() {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    credentials: 'include',
  });
  return await res.json();
}

export async function listConversations() {
  const res = await fetch(`${API_BASE}/conversations`,{
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
}

export async function sendMessage(conversationId: string, message: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

export async function listMessages(conversationId: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
}
