import { z } from 'zod';
import { passwordFieldSchema } from '@/src/lib/validations/sign-up-schema';

export const resetPasswordSchema = z
  .object({
    password: passwordFieldSchema,
    confirmPassword: z.string().min(1, 'Confirm Password is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm Password must exactly match Password.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
