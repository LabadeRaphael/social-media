import { createSlice } from "@reduxjs/toolkit";
// interface User {
//   id: string;
//   userName: string;
// }
const userSlice = createSlice({
    name:'users',
    initialState:{
        currentUser:null, 
        allUser:[],
        selecetedUser:null,
        allConversations:[],
        newConversations:[]
    },
    reducers:{
        setCurrentUser:(state,action)=>{state.currentUser=action.payload},
        setAllUsers:(state,action)=>{state.allUser=action.payload},
        setSelectedUser:(state,action)=>{state.selecetedUser=action.payload},
        setAllConversations:(state,action)=>{state.allConversations=action.payload},
        setNewConversations:(state,action)=>{state.newConversations=action.payload}
    }
})
export const {setCurrentUser,setAllUsers, setSelectedUser, setAllConversations, setNewConversations} = userSlice.actions
export default userSlice.reducer