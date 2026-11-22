// import axios from "axios";
// // Create Axios instance

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003",
//   withCredentials: true, // send cookies
// });

// // Public routes (no auth logic should touch these)
// const PUBLIC_API_ROUTES = [
//   "/auth/login",
//   "/auth/signup",
//   "/auth/forgot-password",
//   "/auth/reset-password",
//   "/auth/recover-account",
//   "/auth/recover-account-verify",
//   "/auth/token-info",
// ];

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;
//     const url = originalRequest?.url || "";
//     const message = error.response?.data?.message;
//     const status = error.response?.status;
//     // ❗ Backend offline / network error
//     if (error.message === "Network Error" || !error.response) {
//       return Promise.reject({
//         message: "Unable to connect to the server. Please try again later.",
//         status: 0,
//       });
//     }

//     // ✅ 1. IGNORE PUBLIC ROUTES (VERY IMPORTANT)
//     const isPublicRoute = PUBLIC_API_ROUTES.some((route) =>
//       url.includes(route)
//     );
//     console.log(isPublicRoute);
//     console.log(url);


//     if (isPublicRoute) {
//       console.log("public");

//       return Promise.reject(error); // 🔥 do nothing extra
//     }

//     // ❗ 2. HANDLE 401 (token expired → refresh)
//     if (status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         await api.post("/auth/refresh-token");
//         return api(originalRequest); // retry original request
//       } catch (refreshError) {
//         if (typeof window !== "undefined") {
//           window.location.href = "/auth/login";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     // ❗ 3. HANDLE 403 (forbidden / locked account)
//     if (status === 403) {
//       if (message?.toLowerCase().includes("locked")) {
//         if (typeof window !== "undefined") {
//           window.location.href = "/auth/login";
//         }
//       }
//       if (message?.toLowerCase().includes("forbidden") && !isPublicRoute) {
//         console.log("hitting");
//         if (typeof window !== "undefined") {
//           window.location.href = "/auth/login";
//         }

//       }
//       //  window.location.href = "/auth/login";
//       // Optional: log for debugging only
//       console.log("Forbidden:", message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003",
  withCredentials: true,
});

// Routes that must never trigger automatic refresh logic.
const PUBLIC_API_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/recover-account",
  "/auth/recover-account-verify",
  "/auth/token-info",
  "/auth/refresh-token",
];

const isPublicApiRoute = (url: string) => {
  try {
    const pathname = new URL(url, api.defaults.baseURL).pathname;
    return PUBLIC_API_ROUTES.includes(pathname);
  } catch {
    return false;
  }
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const message = error.response?.data?.message;
    const status = error.response?.status;

    // 1. Network or backend connection failure
    if (!error.response) {
      return Promise.reject(error);
    }

    // 2. Ignore public authentication endpoints.
    // In particular, refresh-token must not refresh itself.
    if (isPublicApiRoute(url)) {
      return Promise.reject(error);
    }

    // 3. Handle expired access tokens on protected requests.
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh-token");

        // Retry the original protected request.
        return api(originalRequest);
      } catch (refreshError) {
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        // Only redirect when the refresh token is rejected.
        // Network/server failures should not force logout.
        if (
          (refreshStatus === 401 || refreshStatus === 403) &&
          typeof window !== "undefined"
        ) {
          window.location.replace("/auth/login");
        }

        return Promise.reject(refreshError);
      }
    }

    // 4. Handle locked accounts separately.
    if (
      status === 403 &&
      message?.toLowerCase().includes("locked")
    ) {
      if (typeof window !== "undefined") {
        window.location.replace("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
