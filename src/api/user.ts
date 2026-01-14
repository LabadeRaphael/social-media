import { Message } from "@/types/messages";
import api from "./axiosInstance";
import { UploadVoicePayload } from "@/types/audio";

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
const blockUser = async (targetUserId?: string) => {
  try {
    console.log("Block user",targetUserId);
    
    const response = await api.post(`/users/block/${targetUserId}`);
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const unblockUser = async (blockedUserId?: string) => {
  try {
    console.log("Block user",blockedUserId);
    
    const response = await api.post(`/users/unblock/${blockedUserId}`);
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const clearChat = async (conversationId?: string) => {
  try {
    console.log("Block user",conversationId);
    
    const response = await api.post(`/conversations/${conversationId}/clear-chat`);
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
    console.log(error);
      
    throw error.response?.data || error;
  }
}

const resetUnreadCount = async (conversationId?: string) => {
  try {
    const response = await api.patch(`/conversations/${conversationId}/unread/reset`);
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const markMessagesAsRead = async (conversationId: string) => {
  try {
    const response = await api.post("/mark-read", { conversationId });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const getMessages = async (conversationId?: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const sendAudio = async (formData: any) => {
  try {
    
    const response = await api.post('/messages/voice', formData
    );
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
const sendDocument = async (formData: any) => {
  try {
    
    const response = await api.post('/messages/document', formData
    );
    return response.data

  } catch (error: any) {
    throw error.response?.data || error;
  }
}
export { getCurrentUser, getAllUsers, getAllConversations, createNewConversations, sendMessage,resetUnreadCount,getMessages,markMessagesAsRead,sendAudio,sendDocument, blockUser,unblockUser,clearChat }