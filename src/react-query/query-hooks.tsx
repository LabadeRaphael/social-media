"use client"
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getAllUsers, getAllConversations } from "@/api/user";
import { useDispatch } from "react-redux";
import { setAllUsers, setCurrentUser } from "@/redux/users-slice";
import { useEffect } from "react";

// ✅ Get single user
const useCurrentUser=()=> {
 const dispatch = useDispatch()
    const query = useQuery({
        queryKey: ["profile"], // unique cache key
        queryFn: () => getCurrentUser(),
    });
    useEffect(() => {
        if (query.data) {
            dispatch(setCurrentUser(query.data));
        }
    }, [query.data, dispatch]);
    console.log(query.data);
    
    return query
}


// ✅ Get all users
const useAllUsers=(searchKey?: string)=> {
    const dispatch = useDispatch()
    const query = useQuery({
        queryKey: ["users", searchKey],
        queryFn: () => getAllUsers(searchKey),
    });
    useEffect(() => {
        if (query.data) {
            dispatch(setAllUsers(query.data));
        }
    }, [query.data, dispatch]);
    return query;
}
const useAllConversations=(userId)=>{
    const dispatch = useDispatch()
    const query = useQuery({
        queryKey: ["users", userId],
        queryFn: () => getAllConversations(userId),
        enabled: !!userId
    });
    useEffect(() => {
        if (query.data) {
            dispatch(setAllUsers(query.data));
        }
    }, [query.data, dispatch]);
    return query;
}
export {useAllUsers,useCurrentUser,useAllConversations}
