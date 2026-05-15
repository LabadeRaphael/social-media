import axios from "axios";
// Create Axios instance

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003",
  withCredentials: true, // send cookies
});

// Public routes (no auth logic should touch these)
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/recover-account",
  "/auth/recover-account-verify",
  "/auth/token-info",
];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const message = error.response?.data?.message;
    const status = error.response?.status;
    // ❗ Backend offline / network error
    if (error.message === "Network Error" || !error.response) {
      return Promise.reject({
        message: "Unable to connect to the server. Please try again later.",
        status: 0,
      });
    }

    // ✅ 1. IGNORE PUBLIC ROUTES (VERY IMPORTANT)
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      url.includes(route)
    );
    console.log(isPublicRoute);
    console.log(url);


    if (isPublicRoute) {
      console.log("public");

      return Promise.reject(error); // 🔥 do nothing extra
    }

    // ❗ 2. HANDLE 401 (token expired → refresh)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh-token");
        return api(originalRequest); // retry original request
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // ❗ 3. HANDLE 403 (forbidden / locked account)
    if (status === 403) {
      if (message?.toLowerCase().includes("locked")) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      if (message?.toLowerCase().includes("forbidden") && !isPublicRoute) {
        console.log("hitting");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

      }
      //  window.location.href = "/auth/login";
      // Optional: log for debugging only
      console.log("Forbidden:", message);
    }

    return Promise.reject(error);
  }
);

export default api;