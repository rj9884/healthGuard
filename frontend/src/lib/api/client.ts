const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hg_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * `fallback` is only ever returned for GET requests (mock-mode short-circuit,
 * or a failed fetch). For PATCH/PUT it's unused — the error is rethrown
 * instead — so callers making a PATCH/PUT with no sensible fallback value
 * can pass `null`.
 */
export async function fetchJson<T>(
  path: string,
  fallback: T | null,
  method: "GET" | "PATCH" | "PUT" = "GET",
  body?: unknown,
): Promise<T> {
  if (USE_MOCK_DATA && method === "GET") {
    return fallback as T;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      cache: "no-store",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...getAuthHeaders(),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hg_access_token");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
      }
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }

    return (await response.json()) as T;
  } catch (e) {
    if (method === "GET") return fallback as T;
    throw e;
  }
}

export async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload,
): Promise<TResponse> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hg_access_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  return (await response.json()) as TResponse;
}

export async function deleteJson(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hg_access_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Delete failed");
  }
}

export async function postFormData<TResponse>(
  path: string,
  payload: FormData,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: payload,
  });

  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hg_access_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }

  return (await response.json()) as TResponse;
}
