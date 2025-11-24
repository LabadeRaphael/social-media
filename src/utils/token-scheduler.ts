// import api from "@/api/axiosInstance"; // your Axios instance

// let refreshTimeout: NodeJS.Timeout | null = null;
// const scheduleTokenRefresh=(expireAt: number)=> {
//   if (!expireAt) return;

//   const now = Date.now();
//   const msLeft = expireAt - now;

//   // refresh 1 minute before expiration
//   const refreshTime = msLeft - 60_000;
//     console.log("scheduleTokenRefresh", { expireAt, now, msLeft, refreshTime });

//   if (refreshTime <= 0) {
//     // token almost expired, refresh immediately
//     api.post("/auth/refresh-token");
//     return;
//   }

//   if (refreshTimeout) clearTimeout(refreshTimeout);

//   refreshTimeout = setTimeout(() => {
//     api.post("/auth/refresh-token");
//   }, refreshTime);
// }

// const clearTokenRefresh=()=> {
//   if (refreshTimeout) clearTimeout(refreshTimeout);
//   refreshTimeout = null;
// }
// export {scheduleTokenRefresh ,clearTokenRefresh}
import api from "@/api/axiosInstance";

let refreshTimeout: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = (expireAt: number) => {
  if (!expireAt) return;

  const now = Date.now();
  const msLeft = expireAt - now;

  // refresh 1 minute before expiration
  const refreshTime = msLeft - 60_000;
  console.log("scheduleTokenRefresh", { expireAt, now, msLeft, refreshTime });

  if (refreshTime <= 0) {
    console.log("almost expire");
    
    // token almost expired, refresh immediately
    refreshToken();
    return;
  }

  if (refreshTimeout) clearTimeout(refreshTimeout);

  refreshTimeout = setTimeout(() => {
    refreshToken();
  }, refreshTime);
};

const refreshToken = async () => {
  try {
    const res = await api.post("/auth/refresh-token");
    console.log("Token refreshed", res.data);

    // Schedule the next refresh
    console.log(res.data.accessTokenExpireAt);
    
    if (res.data.accessTokenExpireAt) {
      scheduleTokenRefresh(res.data.accessTokenExpireAt);
    }
  } catch (err) {
    console.error("Refresh token failed", err);
    // Optionally log out
    if (typeof window !== "undefined") window.location.href = "/auth/login";
  }
};

const clearTokenRefresh = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = null;
};

export { scheduleTokenRefresh, clearTokenRefresh };
