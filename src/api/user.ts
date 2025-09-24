import api from "./axiosInstance";

const getCurrentUser = async()=>{
    try {
            const response = await api.get("/users/profile");
            return response.data
    
          } catch (error: any) {
            // Let React Query know it's an error
    throw error.response?.data || error;
          } 
}
const getAllUsers = async (searchKey?:string)=>{
    try {
            const response = await api.get("/users/search", {
              params: {
                userName: searchKey,
              },
            });
            return response.data
    
          } catch (error: any) {
            return error
          } 
}
const getAllConversations = async (searchKey?:string)=>{
    try {
            const response = await api.get("/users/search", {
              params: {
                userId: searchKey,
              },
            });
            return response.data
    
          } catch (error: any) {
            return error
          } 
}
export { getCurrentUser, getAllUsers, getAllConversations}