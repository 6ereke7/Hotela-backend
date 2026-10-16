import { z } from "zod";

const receptionistFields = {
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  phoneNumber: z.string().trim().min(6).max(20),
};

export const createReceptionistSchema = z.object({
  ...receptionistFields,
  password: z.string().min(8).max(100),
});

export const updateReceptionistSchema = z
  .object({
    ...receptionistFields,
    password: z.string().min(8).max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((values) => Object.keys(values).length > 0, {
    message: "Provide at least one field to update",
  });

export const staffIdSchema = z.object({ id: z.uuid() });
