import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' })
});

export const signupSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string()
    .min(1, { message: 'Please confirm your password.' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' })
});
