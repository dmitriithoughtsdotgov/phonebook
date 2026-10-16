"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FieldError, SERVER_ERROR } from "@/components/FieldError";
import { phoneSchema, type PhoneFormValues } from "@/lib/phoneSchema";
import { isUnauthorized, phoneKeys, postPhone, rejectedFields } from "@/lib/queries";

const defaultValues: PhoneFormValues = { number: "", label: "", visibility: "PRIVATE" };

const inputClass =
  "mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

export function AddPhoneForm() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PhoneFormValues>({ resolver: yupResolver(phoneSchema), defaultValues });
  // Messages are kept as translation keys so they follow a language switch.
  const [message, setMessage] = useState<{ type: "success" | "error"; key: string } | null>(null);

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: postPhone,
    // Returning the promise keeps the form "saving" until the refreshed list has arrived.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: phoneKeys.all }),
  });

  const clearMessage = () => setMessage(null);

  const onSubmit = handleSubmit((values) => {
    clearMessage();
    mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        setMessage({ type: "success", key: "form.saved" });
      },
      onError: (error) => {
        if (isUnauthorized(error)) {
          setMessage({ type: "error", key: "auth.sessionExpired" });
          return;
        }
        const fields = rejectedFields(error);
        if (!fields) {
          setMessage({ type: "error", key: "form.saveFailed" });
          return;
        }
        for (const field of fields) {
          setError(field, { type: SERVER_ERROR });
        }
        setMessage({ type: "error", key: "form.checkInput" });
      },
    });
  }, clearMessage);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t("form.number")}</span>
          <input
            type="tel"
            placeholder={t("form.numberPlaceholder")}
            aria-invalid={errors.number ? "true" : "false"}
            className={`${inputClass} ${errors.number ? "border-red-500" : ""}`}
            {...register("number")}
          />
          <FieldError error={errors.number} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t("form.label")}</span>
          <input
            placeholder={t("form.labelPlaceholder")}
            aria-invalid={errors.label ? "true" : "false"}
            className={`${inputClass} ${errors.label ? "border-red-500" : ""}`}
            {...register("label")}
          />
          <FieldError error={errors.label} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">{t("form.visibility")}</legend>
        <div className="mt-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" value="PRIVATE" className="text-blue-600 focus:ring-blue-500" {...register("visibility")} />
            <span>
              {t("form.private")} <span className="text-sm text-gray-500">{t("form.privateHint")}</span>
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="SHARED" className="text-blue-600 focus:ring-blue-500" {...register("visibility")} />
            <span>
              {t("form.shared")} <span className="text-sm text-gray-500">{t("form.sharedHint")}</span>
            </span>
          </label>
        </div>
        <FieldError error={errors.visibility} />
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? t("form.submitting") : t("form.submit")}
        </button>
        {message && (
          <p role="status" className={message.type === "success" ? "text-green-700" : "text-red-600"}>
            {t(message.key)}
          </p>
        )}
      </div>
    </form>
  );
}
