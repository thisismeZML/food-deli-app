import { z } from 'zod';

export const userUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  role: z.enum(['customer', 'admin', 'owner']),

  photo: z.instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => !file || file.type.startsWith('image/'), 'File must be an image')
});

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
