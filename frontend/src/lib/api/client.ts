const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK_DATA) {
    return fallback;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return (await response.json()) as TResponse;
}

export async function deleteJson(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
  });

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
    body: payload,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return (await response.json()) as TResponse;
}
