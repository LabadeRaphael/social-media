
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import MessageAlert from "@/components/message-alert";
import { useEffect, useState } from "react";

const googleErrorMessages: Record<
  string,
  { message: string }
> = {
  google_access_denied: {
    message:
      "You cancelled Google sign-in. You can try again whenever you're ready.",
  },
  google_session_invalid: {
    message:
      "Your sign-in session expired or couldn't be verified. Please try again.",
  },
  google_account_exists: {
    message:
      "An account with this email already exists. Sign in using your existing method and connect Google from Settings.",
  },
  google_account_deleted: {
    message:
      "This account is currently unavailable. Please recover your account to continue.",
  },
  google_email_unverified: {
    message:
      "We couldn't verify your Google email address. Try another Google account.",
  },
  google_auth_failed: {
    message:
      "Something went wrong while signing in with Google. Please try again.",
  },
  google_auth_network_error: {
    message:
      "Unable to connect to Google. Check your internet connection and try again.",
  },
};

const GoogleAuthError = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const error = searchParams.get("error");

  const [visible, setVisible] = useState(true);

  // const errorDetails = error ? googleErrorMessages[error] : undefined;
  const [errorDetails, setErrorDetails] = useState<
    (typeof googleErrorMessages)[string] | null
  >(null);

  useEffect(() => {
    if (!error) return;

    // 1. Capture the error message before cleaning the URL.
    const details = googleErrorMessages[error];

    if (details) {
      setErrorDetails(details);
      setVisible(true);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [error, pathname, router, searchParams]);

  if (!errorDetails || !visible) return null;

  return (
    <MessageAlert
      message={errorDetails.message}
      status={false}
      onClose={() => setVisible(false)}
    />
  );
};

export default GoogleAuthError;
