import { z } from "zod";

/**
 * Letters only (English A-Z/a-z + international letters such as Arabic
 * or accented Latin), single spaces allowed between words, no leading/
 * trailing space and no double spaces. Rejects digits, emoji, and
 * symbols such as @ # $ % ^ & *.
 */
const NAME_REGEX = /^\p{L}+(?: \p{L}+)*$/u;

/**
 * 8-64 chars, no whitespace anywhere, at least one lowercase, one
 * uppercase, one digit and one special character.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required.")
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name must be at most 50 characters.")
      .regex(
        NAME_REGEX,
        "Name must contain letters only and single spaces between words (no numbers or symbols).",
      ),
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be between 8 and 64 characters.")
      .max(64, "Password must be between 8 and 64 characters.")
      .refine((val) => !/\s/.test(val), "Password must not contain whitespace.")
      .regex(
        PASSWORD_REGEX,
        "Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required."),
    jobTitle: z.string().trim().max(100).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm Password must exactly match Password.",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

/** Individual password rules, used to render the live checklist in the UI. */
export const passwordRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8 && value.length <= 64,
  },
  {
    id: "case",
    label: "One uppercase, lowercase, and digit",
    test: (value: string) =>
      /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value),
  },
  {
    id: "special",
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value) && !/\s/.test(value),
  },
] as const;

