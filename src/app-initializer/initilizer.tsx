"use client";

import api from "@/api/axiosInstance";
import { useCurrentUser, useJoinAllConversations } from "@/react-query/query-hooks";
import { scheduleTokenRefresh } from "@/utils/token-scheduler";
import { useEffect } from "react";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  // const { data: user, isLoading } = useCurrentUser();
   const { data: user, isSuccess } = useCurrentUser();
 useEffect(() => {
    async function initTokenWatcher() {
      try {
        // Optional: get current access token info from backend
        const res = await api.get("/auth/token-info"); 
        if (res.data.accessTokenExpireAt) {
          scheduleTokenRefresh(res.data.accessTokenExpireAt);
        }
      } catch (err) {
        console.log("User not logged in or token expired");
      }
    }

    initTokenWatcher();
  }, []);


  return <>{children}</>;
}
