// "use client";

// import { getUserToken } from "@/api/user";
// import { clearTokenRefresh, scheduleTokenRefresh } from "@/utils/token-scheduler";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation"
// export default function AppInitializer({ children }: { children: React.ReactNode }) {
//   // const { data: user, isLoading } = useCurrentUser();
//   const { data: user, isSuccess } = getUserToken();
//   const router = useRouter()
//   useEffect(() => {
//     if (!isSuccess || !user?.accessTokenExpireAt) return;

//     scheduleTokenRefresh(user.accessTokenExpireAt, router);

//     return () => {
//       clearTokenRefresh(); 
//     };
//   }, [isSuccess, user?.accessTokenExpireAt, router]);

//   return <>{children}</>;
// }
"use client";

import { useUserToken } from "@/react-query/user-hook";
import {
  clearTokenRefresh,
  scheduleTokenRefresh,
} from "@/utils/token-scheduler";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const PUBLIC_PAGES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/recover-account",
    "/recover-account-verify",
  ];

  const isPublicRoute = PUBLIC_PAGES.some((route) =>
    pathname.startsWith(route)
  );

  const { data: user, isSuccess } = useUserToken(!isPublicRoute);

  useEffect(() => {
    if (!isSuccess || !user?.accessTokenExpireAt) {
      return;
    }

    scheduleTokenRefresh(
      user.accessTokenExpireAt,
      router
    );

    return () => {
      clearTokenRefresh();
    };
  }, [
    isSuccess,
    user?.accessTokenExpireAt,
    router,
  ]);

  return <>{children}</>;
}