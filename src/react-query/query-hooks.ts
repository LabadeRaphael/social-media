"use client";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCurrentUser,
  getAllUsers,
  getAllConversations,
  createNewConversations,
} from "@/api/user";

import { useDispatch } from "react-redux";
import { setSelectedChat } from "@/redux/chats-slice";


// Get current user
const useCurrentUser = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getCurrentUser(),
  });
};


// Get all users
const useAllUsers = (searchKey?: string) => {
  return useQuery({
    queryKey: ["users", searchKey],
    queryFn: () => getAllUsers(searchKey),
  });
};


// Get current user's conversations
const useAllConversations = () => {
  return useQuery({
    queryKey: ["current-user-conv"],
    queryFn: () => getAllConversations(),
  });
};


// Create conversation
const useCreateConversation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { participantIds: string[] }) => {
      console.log("mutationFn data:", data);

      return createNewConversations(data);
    },

    onSuccess: (response) => {
      console.log("onSuccess data:", response);

      const newConversation =
        response?.saveConversation;

      queryClient.invalidateQueries({
        queryKey: ["current-user-conv"],
      });

      dispatch(
        setSelectedChat(newConversation)
      );
    },
  });
};


export {
  useCurrentUser,
  useAllUsers,
  useAllConversations,
  useCreateConversation,
};