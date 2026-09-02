import { BloodGroup, Gender, MaritalStatus } from "@prisma/client";

export type IPatientFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNo?: string | undefined;
};

export type IPatientHealthData = {
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
};

export type IMedicalReport = {
  reportName: string;
  reportLink: string;
};

export type IPatientUpdate = {
  name: string;
  contactNumber: string;
  address: string;
  patientHealthData: IPatientHealthData;
  medicalReport: IMedicalReport;
};

// Patient Profile - for authenticated patient viewing their own profile
export type IPatientProfile = {
  id: string;
  email: string;
  name: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  patientHealthData?: IPatientHealthData | null;
  medicalReport?: Array<{
    id: string;
    reportName: string;
    reportLink: string;
    createdAt: Date;
  }>;
};

// Health Data Update Request
export type IPatientHealthDataUpdate = Partial<IPatientHealthData>;

// Medical Report Upload
export type IMedicalReportCreate = {
  reportName: string;
  reportLink: string;
};
