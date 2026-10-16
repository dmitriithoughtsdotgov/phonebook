import * as yup from "yup";
import "./validation";

/**
 * Validation rules for a new phone number, used by the form for instant feedback in the browser.
 * They mirror the backend's CreatePhoneNumberRequest constraints; the backend remains the
 * authority and validates every request again.
 * Error messages come from the global yup locale in ./validation.
 */
export const phoneSchema = yup.object({
  number: yup.string().trim().required().phone(),
  label: yup.string().trim().max(100).default(""),
  visibility: yup.mixed<"PRIVATE" | "SHARED">().oneOf(["PRIVATE", "SHARED"]).required(),
});

export type PhoneFormValues = yup.InferType<typeof phoneSchema>;
