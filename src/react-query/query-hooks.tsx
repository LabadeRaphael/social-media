"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, getAllUsers, getAllConversations, createNewConversations } from "@/api/user";
import { useDispatch } from "react-redux";
import { setAllConversations, setAllUsers, setCurrentUser, setNewConversations, setSelectedUser } from "@/redux/users-slice";
import { useEffect } from "react";

// ✅ Get single user
const useCurrentUser = () => {
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
    // console.log(query.data);

    return query
}


// ✅ Get all users
const useAllUsers = (searchKey?: string) => {
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
const useAllConversations = () => {
    // console.log(userId);

    const dispatch = useDispatch()
    const query = useQuery({
        queryKey: ["current-user-conv"],
        queryFn: () => getAllConversations(),
        // enabled: !!userId
    });
    useEffect(() => {
        if (query.data) {
            dispatch(setAllConversations(query.data));
        }
    }, [query.data, dispatch]);

    return query;
}
const useCreateConversation = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { participantIds: string[] }) => {
            console.log("mutationFn data:", data);
            return createNewConversations(data); // ✅ return the promise
        },
        onSuccess: (newConversation) => {

            console.log("onSuccess data:", newConversation);

            queryClient.setQueryData<any[] | undefined>(["conversations"], (old) =>
                old ? [newConversation, ...old] : [newConversation]
            );
            dispatch(setSelectedUser(newConversation.id));
        },
    });
};


export { useAllUsers, useCurrentUser, useAllConversations, useCreateConversation }
