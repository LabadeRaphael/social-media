import { configureStore } from '@reduxjs/toolkit'
import userReducer from "@/redux/users-slice"
import chatReducer from "@/redux/chats-slice"
export const store = configureStore({
  reducer: {
    userReducer,
    chatReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch 