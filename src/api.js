// Backend API base URL.
// Override with a .env file (VITE_API_URL=...) or when deploying;
// defaults to the local Flask server.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Generic JSON POST helper. Throws Error with the backend's message when
// the response is not ok, so callers can show meaningful feedback.
export async function apiPost(path, body, { isJson = true } = {}) {
  const options = isJson
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    : { method: "POST", body }; // FormData (file upload)

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed.");
  }
  return data;
}
