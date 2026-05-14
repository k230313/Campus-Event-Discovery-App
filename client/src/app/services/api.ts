let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

function isMutatingMethod(method?: string) {
  const normalizedMethod = (method || "GET").toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod);
}

function buildRequestOptions(init?: RequestInit): RequestInit {
  return {
    credentials: "include",
    ...init,
  };
}

async function fetchCsrfToken() {
  const response = await fetch("/api/csrf-token", buildRequestOptions());

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = await response.json();
  if (typeof data?.csrfToken !== "string" || !data.csrfToken) {
    throw new Error("CSRF token response was invalid");
  }

  csrfToken = data.csrfToken;
  return csrfToken;
}

export async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = fetchCsrfToken().finally(() => {
      csrfTokenRequest = null;
    });
  }

  return csrfTokenRequest;
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfTokenRequest = null;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, buildRequestOptions(init));
}

export async function csrfFetch(input: RequestInfo | URL, init?: RequestInit) {
  const method = init?.method || "GET";

  if (!isMutatingMethod(method)) {
    return apiFetch(input, init);
  }

  const token = await getCsrfToken();
  const headers = new Headers(init?.headers || {});
  headers.set("x-csrf-token", token);

  let response = await fetch(input, buildRequestOptions({
    ...init,
    headers,
  }));

  if (response.status === 403) {
    clearCsrfToken();
    const retryToken = await getCsrfToken();
    const retryHeaders = new Headers(init?.headers || {});
    retryHeaders.set("x-csrf-token", retryToken);
    response = await fetch(input, buildRequestOptions({
      ...init,
      headers: retryHeaders,
    }));
  }

  return response;
}
