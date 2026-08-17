"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateUser } from "@/api/user";

import { UpdateUserPayload } from "@/types/update-user";


const useUpdateUser = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateUserPayload
    ) => {
      const formData =
        new FormData();

      if (data.userName) {
        formData.append(
          "userName",
          data.userName
        );
      }

      if (data.password) {
        formData.append(
          "password",
          data.password
        );
      }

      if (data.avatar) {
        formData.append(
          "avatar",
          data.avatar
        );
      }

      if (data.re_auth_psw) {
        formData.append(
          "re_auth_psw",
          data.re_auth_psw
        );
      }

      return updateUser(formData);
    },

    retry: false,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};


export {
  useUpdateUser,
};