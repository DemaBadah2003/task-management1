import { z } from "zod";

// تاريخ النهارده بصيغة YYYY-MM-DD بالتوقيت المحلي
export function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

export const epicSchema = z.object({
  title: z
    .string()
    .trim() // يشيل المسافات من الأول والآخر قبل التحقق
    .min(3, "Title is required (minimum 3 characters)"),

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),

  assignee_id: z.string().optional(),

  deadline: z
    .string()
    .optional()
    .refine((val) => !val || val >= getToday(), {
      message: "Deadline cannot be before today",
    }),
});

export type EpicFormValues = z.infer<typeof epicSchema>;