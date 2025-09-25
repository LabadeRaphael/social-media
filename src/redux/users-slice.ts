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
        allConversations:[]
    },
    reducers:{
        setCurrentUser:(state,action)=>{state.currentUser=action.payload},
        setAllUsers:(state,action)=>{state.allUser=action.payload},
        setSelectedUser:(state,action)=>{state.selecetedUser=action.payload},
        setAllConversations:(state,action)=>{state.allConversations=action.payload}
    }
})
export const {setCurrentUser,setAllUsers, setSelectedUser, setAllConversations} = userSlice.actions
export default userSlice.reducer