"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import MessageAlert from "@/components/message-alert";
import { IconButton } from "@mui/material";
import { X } from "lucide-react";
import { useEffect } from "react";
const googleErrorMessages: Record<
  string,
  { message: string; severity: "info" | "warning" | "error" }
> = {
  google_access_denied: {
    message:
      "You cancelled Google sign-in. You can try again whenever you're ready.",
    severity: "info",
  },

  google_session_invalid: {
    message:
      "Your sign-in session expired or couldn't be verified. Please try again.",
    severity: "warning",
  },

  google_account_exists: {
    message:
      "An account with this email already exists. Sign in using your existing method and connect Google from Settings.",
    severity: "warning",
  },

  google_account_deleted: {
    message:
      "This account is currently unavailable. Please recover your account to continue.",
    severity: "warning",
  },

  google_email_unverified: {
    message:
      "We couldn't verify your Google email address. Try another Google account.",
    severity: "warning",
  },

  google_auth_failed: {
    message:
      "Something went wrong while signing in with Google. Please try again.",
    severity: "error",
  },
};

const GoogleAuthError = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const error = searchParams.get("error");
  if (!error) return null;

  const errorDetails = error?googleErrorMessages[error]:undefined;
  useEffect(() => {
if (!error) return;

const params = new URLSearchParams(searchParams.toString());

params.delete("error");

const query = params.toString();

router.replace(query ? `${pathname}?${query}` : pathname, {
  scroll: false,
});

}, [error, pathname, router, searchParams]);
  if (!errorDetails) return null;

  return (
    <MessageAlert
      message={errorDetails.message}
      severity={errorDetails.severity}
    />
  );
};

export default GoogleAuthError;