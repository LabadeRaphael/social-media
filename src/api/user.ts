import { Message } from "@/types/messages";
import api from "./axiosInstance";

const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const getAllUsers = async (searchKey?: string) => {
  try {
    const response = await api.get("/users/search", {
      params: {
        userName: searchKey,
      },
    });
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}

const getAllConversations = async () => {
  try {
    const response = await api.get("/conversations/current-user");
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const createNewConversations = async (data?: { participantIds: string[] }) => {
  console.log(data);

  try {
    const response = await api.post("/new-conversations", {
      participants: data?.participantIds
    });
    console.log("response", response);

    return response.data.saveConversation

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const sendMessage = async (messageDetails:Message) => {
  console.log(messageDetails);

  try {
    const response = await api.post("/messages", messageDetails);
    console.log("response", response);

    return response.data.saveConversation

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const getMessages = async (conversationId?: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
export { getCurrentUser, getAllUsers, getAllConversations, createNewConversations, sendMessage,getMessages }