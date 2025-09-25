// import { createSlice } from "@reduxjs/toolkit";

// const chatSlice = createSlice({
//   name: "chat",
//   initialState: {
//     selectedChat: null, // current open chat
//   },
//   reducers: {
//     setSelectedChat: (state, action) => {
//       state.selectedChat = action.payload;
//     },
//     clearSelectedChat: (state) => {
//       state.selectedChat = null;
//     },
//   },
// });

// export const { setSelectedChat, clearSelectedChat } = chatSlice.actions;
// export default chatSlice.reducer;
// src/redux/slices/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  selectedUser: string | null;
}

const initialState: ChatState = { selectedUser: null };

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<string>) {
      state.selectedUser = action.payload;
    },
  },
});

export const { setSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;