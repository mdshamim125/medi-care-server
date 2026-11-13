import { z } from "zod";

const create = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().min(3).max(120).regex(/^[^\r\n]+$/),
    message: z.string().trim().min(10).max(5000),
  }),
});

export const ContactValidation = {
  create,
};

export type ContactInquiryInput = z.infer<typeof create>["body"];
