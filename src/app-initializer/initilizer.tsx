"use client";

import { getUserToken } from "@/api/user";
import { clearTokenRefresh, scheduleTokenRefresh } from "@/utils/token-scheduler";
import { useEffect } from "react";
import { useRouter } from "next/navigation"
export default function AppInitializer({ children }: { children: React.ReactNode }) {
  // const { data: user, isLoading } = useCurrentUser();
  const { data: user, isSuccess } = getUserToken();
  const router = useRouter()
  useEffect(() => {
    if (!isSuccess || !user?.accessTokenExpireAt) return;

    scheduleTokenRefresh(user.accessTokenExpireAt, router);

    return () => {
      clearTokenRefresh(); 
    };
  }, [isSuccess, user?.accessTokenExpireAt, router]);

  return <>{children}</>;
}