// // src/api/api.js
// import axios from "axios";

// // Create a single Axios instance
// const api = axios.create({
//   baseURL: "http://localhost:3003", // your NestJS backend URL
//   withCredentials: true, // ✅ send cookies automatically
// });

// // Add a response interceptor
// api.interceptors.response.use(
//   // 1. If response is OK (status 200–299) → just return it
//   (res) => res,

//   // 2. If response is an error
//   async (error) => {
//     // Case: Unauthorized → token probably expired
//     if (error.response?.status === 401) {
//       try {
//         // Call refresh endpoint to get new access token
//         // await api.post("/auth/refresh-token");

//         // Retry the failed request with the new token
//         // return api(error.config);
//       } catch (refreshError) {
//         console.error("Refresh failed, logging out...");
//         // Optional: redirect to login page
//         window.location.href = "/auth/login"; // redirect to login
//       }
//     }

//     // For other errors (403, 404, 500, etc.), just pass them on
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/api/api.ts
import axios from "axios";

// Create a single Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003",
  withCredentials: true, // ✅ send cookies automatically
});

// api.interceptors.response.use(
//   res => res,
//   async error => {
//     const originalRequest = error.config;

//     // Case 1: Login attempt failed
//     if (originalRequest?.url?.includes("/auth/login")) {
//       return Promise.reject(error); // just return the error to show "invalid credentials"
//     }

//     // Case 2: Expired token, try refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         await api.post("/auth/refresh-token");
//         return api(originalRequest); // retry with new token
//       } catch (refreshError) {
//         if (typeof window !== 'undefined') {
//           window.location.href = "/auth/login";
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // ❗ Backend is OFFLINE (Network Error)
    if (error.message === "Network Error" || !error.response) {
      return Promise.reject({
        message: "Unable to connect to the server. Please try again later.",
        status: 0,
      });
    }

    // ❗ Login attempt failed
    if (originalRequest?.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // ❗ Token expired → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("visit the refresh-token");
        await api.post("/auth/refresh-token");
        console.log("after visiting the refresh-token");
        
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);



export default api;
