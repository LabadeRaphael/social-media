"use client";

import { useCurrentUser, useJoinAllConversations } from "@/react-query/query-hooks";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  // const { data: user, isLoading } = useCurrentUser();
   const { data: user, isSuccess } = useCurrentUser();
    
    // useJoinAllConversations(user);
    //  useJoinAllConversations(user)

//   if (isLoading) {
//     return <p>Loading user...</p>; // You can style with a spinner
//   }
    // console.log(user);

  

  return <>{children}</>;
}
