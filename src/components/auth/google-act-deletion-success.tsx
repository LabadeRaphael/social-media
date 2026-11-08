
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import MessageAlert from "@/components/message-alert";
import { useEffect, useState } from "react";

const GoogleAcccountDeletionSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const success = searchParams.get("success");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (success !== "account_deleted") return;

    // Display the success message.
    setVisible(true);

    // Remove the success parameter without reloading the page.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("success");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [success, pathname, router, searchParams]);

  if (!visible) return null;

  return (
    <MessageAlert
      message="Your Nestfinity account has been deleted successfully. You can recover your account within the 30-day recovery period."
      status={true}
      onClose={() => setVisible(false)}
    />
  );
};

export default GoogleAcccountDeletionSuccess;
