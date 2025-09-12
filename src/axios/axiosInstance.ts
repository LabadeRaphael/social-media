// src/api/api.js
import axios from "axios";

// Create a single Axios instance
const api = axios.create({
  baseURL: "http://localhost:3003", // your NestJS backend URL
  withCredentials: true, // ✅ send cookies automatically
});

// Add a response interceptor
api.interceptors.response.use(
  // 1. If response is OK (status 200–299) → just return it
  (res) => res,

  // 2. If response is an error
  async (error) => {
    // Case: Unauthorized → token probably expired
    if (error.response?.status === 401) {
      try {
        // Call refresh endpoint to get new access token
        // await api.post("/auth/refresh-token");

        // Retry the failed request with the new token
        // return api(error.config);
      } catch (refreshError) {
        console.error("Refresh failed, logging out...");
        // Optional: redirect to login page
        window.location.href = "/auth/login"; // redirect to login
      }
    }

    // For other errors (403, 404, 500, etc.), just pass them on
    return Promise.reject(error);
  }
);

export default api;
