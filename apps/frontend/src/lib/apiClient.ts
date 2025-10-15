const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  authRequired: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authRequired) {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
