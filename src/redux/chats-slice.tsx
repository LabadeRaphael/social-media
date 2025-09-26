import { Conversation } from "@/types/conversation";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface ChatState {
  selectedChat: Conversation | null;
}

const initialState: ChatState = { selectedChat: null };

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChat(state, action: PayloadAction<Conversation | null>) {
      state.selectedChat = action.payload;
    },
  },
});

export const { setSelectedChat } = chatSlice.actions;
export default chatSlice.reducer;

