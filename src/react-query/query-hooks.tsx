"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, getAllUsers, getAllConversations, createNewConversations, getMessages, sendMessage } from "@/api/user";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "@/redux/users-slice";
import { Message } from "@/types/messages";
import { setSelectedChat } from "@/redux/chats-slice";

// ✅ Get single user
const useCurrentUser = () => {
    const query = useQuery({
        queryKey: ["profile"], // unique cache key
        queryFn: () => getCurrentUser(),
    });

    return query
}


// ✅ Get all users
const useAllUsers = (searchKey?: string) => {
    const query = useQuery({
        queryKey: ["users", searchKey],
        queryFn: () => getAllUsers(searchKey),
    });
  
    return query;
}
const useAllConversations = () => {
    const query = useQuery({
        queryKey: ["current-user-conv"],
        queryFn: () => getAllConversations(),
    });

    return query;
}
const useCreateConversation = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { participantIds: string[] }) => {
            console.log("mutationFn data:", data);
            return createNewConversations(data); // ✅ return the promise
        },
        onSuccess: (newConversation) => {

            console.log("onSuccess data:", newConversation);

             queryClient.invalidateQueries({ queryKey: ["current-user-conv"] });
            dispatch(setSelectedChat(newConversation));
        },
    });
};
const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageDetails:Message) => {
            console.log("mutationFn data:", messageDetails);
            return sendMessage(messageDetails);
        },
        onSuccess: (newMessage,variables) => {

            console.log("onSuccess data:", newMessage);

             queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
        },
    });
};

const  useMessages=(conversationId: string | null)=> {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error("No conversationId"); // no chat selected yet
      return getMessages(conversationId);
    },
    enabled: !!conversationId, // only run when a chat is selected
  });
}

export { useAllUsers, useCurrentUser, useAllConversations, useCreateConversation, useSendMessage,useMessages }
