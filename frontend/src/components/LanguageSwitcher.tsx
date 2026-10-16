"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { languageCookie, languages, type Language } from "@/i18n/settings";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (lng: Language) => {
    document.cookie = `${languageCookie}=${lng}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    void i18n.changeLanguage(lng);
    // Re-render server components (page texts, dates) in the new language.
    startTransition(() => router.refresh());
  };

  return (
    <div role="group" aria-label={t("language.label")} className="flex gap-1 text-sm">
      {languages.map((lng) => {
        const active = i18n.language === lng;
        return (
          <button
            key={lng}
            type="button"
            lang={lng}
            title={t(`language.${lng}`)}
            aria-pressed={active}
            disabled={active || isPending}
            onClick={() => switchTo(lng)}
            className={`rounded px-2 py-0.5 font-medium uppercase ${
              active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {lng}
          </button>
        );
      })}
    </div>
  );
}
