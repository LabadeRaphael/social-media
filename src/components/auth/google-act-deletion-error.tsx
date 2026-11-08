"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const googleDeleteErrorMessages: Record<string, string> = {
  google_session_invalid:
    "Your session has expired. Please sign in again.",

  google_delete_verification_failed:
    "The Google account could not be verified against your Nestfinity account.",

  google_access_denied:
    "You cancelled Google verification.",

  google_account_deleted:
    "This account has already been deleted. Please recover your account.",

  google_auth_failed:
    "Something went wrong during Google verification. Please try again.",
};

const GoogleDeleteError = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;

    const message = googleDeleteErrorMessages[error];

    if (message) {
      toast.error(message);
    }

    // Remove the error parameter after displaying the toast.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [error, pathname, router, searchParams]);

  return null;
};

export default GoogleDeleteError;