import "server-only";

import { createInstance } from "i18next";
import { cookies } from "next/headers";
import { cache } from "react";
import { i18nOptions, languageCookie, toLanguage } from "./settings";

/** Language chosen by the user (cookie), Czech by default. */
export const getLanguage = cache(async () => toLanguage((await cookies()).get(languageCookie)?.value));

/** Translation function for server components and route handlers, created once per request. */
export const getTranslation = cache(async () => {
  const lng = await getLanguage();
  const i18n = createInstance();
  await i18n.init(i18nOptions(lng));
  return { t: i18n.t, lng };
});
