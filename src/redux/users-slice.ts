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
        allConversations:[]
    },
    reducers:{
        setCurrentUser:(state,action)=>{state.currentUser=action.payload},
        setAllUsers:(state,action)=>{state.allUser=action.payload},
        setAllConversations:(state,action)=>{state.allConversations=action.payload}
    }
})
export const {setCurrentUser,setAllUsers,setAllConversations} = userSlice.actions
export default userSlice.reducer