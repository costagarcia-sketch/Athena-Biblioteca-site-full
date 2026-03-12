/**
 * Intercepts the global fetch to automatically append the authentication token
 * to requests made by the generated @workspace/api-client-react hooks.
 */
export function setupApiInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem("biblioteca_token");
    
    let headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const modifiedInit: RequestInit = {
      ...init,
      headers,
      credentials: "omit", // Using Bearer token instead of cookies based on instructions
    };

    const response = await originalFetch(input, modifiedInit);
    
    // Global 401 handler
    if (response.status === 401) {
      localStorage.removeItem("biblioteca_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return response;
  };
}
