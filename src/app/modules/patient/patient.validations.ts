import { z } from "zod";
import { Gender, BloodGroup, MaritalStatus } from "@prisma/client";

// Patient Health Data Validation
export const PatientHealthDataValidationSchema = z.object({
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().datetime().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  hasAllergies: z.boolean().optional(),
  hasDiabetes: z.boolean().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  smokingStatus: z.boolean().optional(),
  dietaryPreferences: z.string().optional(),
  pregnancyStatus: z.boolean().optional(),
  mentalHealthHistory: z.string().optional(),
  immunizationStatus: z.string().optional(),
  hasPastSurgeries: z.boolean().optional(),
  recentAnxiety: z.boolean().optional(),
  recentDepression: z.boolean().optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
});

// Medical Report Upload Validation
export const MedicalReportUploadValidationSchema = z.object({
  reportName: z.string().min(1, "Report name is required"),
});

// Patient Profile Update Validation
export const PatientProfileUpdateValidationSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

export type PatientHealthDataInput = z.infer<
  typeof PatientHealthDataValidationSchema
>;
export type MedicalReportUploadInput = z.infer<
  typeof MedicalReportUploadValidationSchema
>;
export type PatientProfileUpdateInput = z.infer<
  typeof PatientProfileUpdateValidationSchema
>;
