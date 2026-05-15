import api from "@/api/axiosInstance";
let refreshTimeout: NodeJS.Timeout | null = null;
const scheduleTokenRefresh = (expireAt: number, router: any) => {
  if (!expireAt) return;
  
  const now = Date.now();
  const msLeft = expireAt - now;
  // refresh 1 minute before expiration
  const refreshTime = msLeft - 60_000;
  console.log("scheduleTokenRefresh", { expireAt, now, msLeft, refreshTime });
  
  if (refreshTime <= 0) {
    console.log("almost expire");
    
    // token almost expired, refresh immediately
    refreshToken(router);
    return;
  }
  
  if (refreshTimeout) clearTimeout(refreshTimeout);
  
  refreshTimeout = setTimeout(() => {
    refreshToken(router);
  }, refreshTime);
};

const refreshToken = async (router:any) => {
  try {
    const res = await api.post("/auth/refresh-token");
    console.log("Token refreshed", res.data);

    // Schedule the next refresh
    console.log(res.data.accessTokenExpireAt);
    
    if (res.data.accessTokenExpireAt) {
      scheduleTokenRefresh(res.data.accessTokenExpireAt, router);
    }
  } catch (err) {
    console.error("Refresh token failed", err);
    // Optionally log out
    router.push("/auth/login")
  }
};

const clearTokenRefresh = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = null;
};

export { scheduleTokenRefresh, clearTokenRefresh };
