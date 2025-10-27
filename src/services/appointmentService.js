

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export async function createAppointment(createAppointmentDTO) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/appointment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(createAppointmentDTO),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => null);
        let err;
        try { err = await res.json(); } catch(e) { err = errText || res.statusText; }
        const message = err?.message || err || `HTTP ${res.status} ${res.statusText}`;
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return res.json();
}