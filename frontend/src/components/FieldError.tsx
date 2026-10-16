"use client";

import type { FieldError as HookFormFieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { translateError } from "@/lib/validation";

/** Error set with setError() for a field the backend rejected; it explains itself in English only. */
export const SERVER_ERROR = "server";

/** Message under a form field: yup errors are translated, backend rejections get a generic text. */
export function FieldError({ error }: { error?: HookFormFieldError }) {
  const { t } = useTranslation();
  if (!error) return null;

  const text = error.type === SERVER_ERROR ? t("validation.invalid") : translateError(t, error.message);
  return <span className="mt-1 block text-sm text-red-600">{text}</span>;
}
