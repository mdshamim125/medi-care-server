import { z } from "zod";

const create = z.object({
  body: z.object({
    appointmentId: z.string({
      error: "Appointment Id is required",
    }),
    healthIssue: z.string({
      error: "Health issue is required",
    }),
    givenTest: z.string().optional(),
    instructions: z.string({
      error: "Instructions are required",
    }),
    followUpDate: z.string().optional(),
  }),
});

export const PrescriptionValidation = {
  create,
};
