// import { useEffect, useState } from "react";
// import { getSocket } from "@/lib/socket";

// export const useOnlineUsers = () => {
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
//  console.log("Online users updated:", Array.from(onlineUsers));
//   useEffect(() => {
//     const socket = getSocket();

//     const handleUserOnline = (data: { userId: string }) => {
//     console.log("data", data);
    
//       setOnlineUsers(prev => new Set(prev).add(data.userId));
//     };

//     const handleUserOffline = (data: { userId: string }) => {
//       setOnlineUsers(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(data.userId);
//         return newSet;
//       });
//     };
//      const handleInitialList = (userIds: string[]) => {
//       setOnlineUsers(new Set(userIds));
//     };
//     socket.on("user_online", handleUserOnline);
//     socket.on("user_offline", handleUserOffline);
//     socket.on("online_users", handleInitialList);

//     return () => {
//       socket.off("user_online", handleUserOnline);
//       socket.off("user_offline", handleUserOffline);
//       socket.off("online_users", handleInitialList);
//     };
//   }, []);

//   return onlineUsers;
// };


import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return
    const handleOnlineUsers = (userIds: string[]) => {
      console.log("Updated online users:", userIds);
      setOnlineUsers(new Set(userIds));
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("online_users", handleOnlineUsers);
    };
  }, []);

  return onlineUsers;
};

