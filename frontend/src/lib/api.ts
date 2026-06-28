export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token") || "";
  }

  const headers = {
    ...options.headers,
    ...(token ? { "x-auth-token": token } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
