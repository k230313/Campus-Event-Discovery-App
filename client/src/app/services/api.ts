// ============================================
// File:    api.ts
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Provides frontend service logic for api.
// ============================================

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

/**
 * Executes the is mutating method logic.
 * @param {*} method - Represents the method input.
 * @returns {*} Returns the resulting value.
 */
function isMutatingMethod(method?: string) {
  const normalizedMethod = (method || "GET").toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod);
}

/**
 * Executes the build request options logic.
 * @param {*} init - Represents the init input.
 * @returns {*} Returns the resulting value.
 */
function buildRequestOptions(init?: RequestInit): RequestInit {
  return {
    credentials: "include",
    ...init,
  };
}

/**
 * Asynchronously executes the fetch csrf token logic.
 * @returns {*} Returns the resulting value.
 */
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

/**
 * Asynchronously executes the get csrf token logic.
 * @returns {*} Returns the resulting value.
 */
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

/**
 * Executes the clear csrf token logic.
 * @returns {*} Returns the resulting value.
 */
export function clearCsrfToken() {
  csrfToken = null;
  csrfTokenRequest = null;
}

/**
 * Asynchronously executes the api fetch logic.
 * @param {*} input - Represents the input input.
 * @param {*} init - Represents the init input.
 * @returns {*} Returns the resulting value.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, buildRequestOptions(init));
}

/**
 * Asynchronously executes the csrf fetch logic.
 * @param {*} input - Represents the input input.
 * @param {*} init - Represents the init input.
 * @returns {*} Returns the resulting value.
 */
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
