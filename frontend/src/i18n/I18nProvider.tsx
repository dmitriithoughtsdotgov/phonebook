"use client";

import { createInstance } from "i18next";
import { useEffect, useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { i18nOptions, type Language } from "./settings";

/** Gives client components `useTranslation()`, starting in the language the server rendered with. */
export function I18nProvider({ lng, children }: { lng: Language; children: React.ReactNode }) {
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance.use(initReactI18next).init(i18nOptions(lng));
    return instance;
  });

  useEffect(() => {
    if (i18n.language !== lng) void i18n.changeLanguage(lng);
  }, [i18n, lng]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
