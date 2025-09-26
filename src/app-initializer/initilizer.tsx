"use client";

import { useCurrentUser } from "@/react-query/query-hooks";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

//   if (isLoading) {
//     return <p>Loading user...</p>; // You can style with a spinner
//   }
    // console.log(user);

  

  return <>{children}</>;
}
