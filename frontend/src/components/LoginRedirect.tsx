"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LAST_ATTEMPT_KEY = "phonebook:last-login-attempt";
/** If we were already sent to Keycloak this recently, stop and show a button instead of looping. */
const LOOP_GUARD_MS = 10_000;

function recentlyAttempted(): boolean {
  try {
    const last = Number(sessionStorage.getItem(LAST_ATTEMPT_KEY));
    return Number.isFinite(last) && Date.now() - last < LOOP_GUARD_MS;
  } catch {
    return false;
  }
}

function login(callbackUrl: string) {
  try {
    sessionStorage.setItem(LAST_ATTEMPT_KEY, String(Date.now()));
  } catch {
    // storage unavailable – the loop guard is best effort only
  }
  void signIn("keycloak", { callbackUrl });
}

type Props = { callbackUrl: string; auto: boolean; loggedOut: boolean };

/**
 * Sends the user straight to Keycloak. Falls back to a manual button after logout, after an
 * authentication error, or when an automatic attempt has just failed (prevents redirect loops).
 */
export function LoginRedirect({ callbackUrl, auto, loggedOut }: Props) {
  const { t } = useTranslation();
  const [redirecting, setRedirecting] = useState(auto);

  useEffect(() => {
    if (!auto) return;
    if (recentlyAttempted()) {
      setRedirecting(false);
      return;
    }
    login(callbackUrl);
  }, [auto, callbackUrl]);

  if (redirecting) {
    return <p className="text-gray-600">{t("auth.redirecting")}</p>;
  }

  return (
    <>
      <p className="text-gray-600">{loggedOut ? t("auth.loggedOut") : t("auth.loginPrompt")}</p>
      <button
        type="button"
        onClick={() => login(callbackUrl)}
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
      >
        {t("auth.login")}
      </button>
    </>
  );
}
