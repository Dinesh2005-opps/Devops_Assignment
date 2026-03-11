// Centralized fetch wrapper to handle JWT Authentication
export const getToken = () => localStorage.getItem("orpha_token");
export const setToken = (token: string) => localStorage.setItem("orpha_token", token);
export const clearToken = () => localStorage.removeItem("orpha_token");

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Only set Content-Type if we're sending JSON and it's not already set
  if (options.body && typeof options.body === 'string' && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    // Automatically clear token on 401
    if (response.status === 401) {
      clearToken();
      // Optional: window.location.href = '/login'; if we want hard redirect
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
