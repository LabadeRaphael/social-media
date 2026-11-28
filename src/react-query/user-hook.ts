"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { loginUser, resendVerification, updateUser, verifyEmail, verifyRecoverAccount } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import { UpdateUserPayload } from "@/types/update-user";
import { getUserToken } from "@/api/user";
import { LoginPayload } from "@/types/login";
// const useUserToken = (enabled: boolean) => {
//   return useQuery({
//     queryKey: ["user-token"],
//     queryFn: getUserToken,
//     enabled,
//     retry: false,
//   });
// };


const useUserToken = (enabled: boolean) => {
  return useQuery({
    queryKey: ["user-token"],
    queryFn: getUserToken,
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};
const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-token"],
      });
    },
  });
};
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


const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    retry: false,
  });
};

const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
    retry: false,
  });
};

export const useVerifyRecoverAccount = () =>
  useMutation({
    mutationFn: (token: string) => verifyRecoverAccount(token),
    retry: false,
  });



export {
 useUserToken, useLogin, useUpdateUser,
 useVerifyEmail, useResendVerification
};
