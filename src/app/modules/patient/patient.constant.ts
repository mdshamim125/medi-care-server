export const patientSearchableFields: string[] = ["name", "email", "contactNo"];

export const patientFilterableFields: string[] = [
  "searchTerm",
  "email",
  "contactNumber",
];

export const patientHealthDataFields: string[] = [
  "gender",
  "dateOfBirth",
  "bloodGroup",
  "hasAllergies",
  "hasDiabetes",
  "height",
  "weight",
  "smokingStatus",
  "dietaryPreferences",
  "pregnancyStatus",
  "mentalHealthHistory",
  "immunizationStatus",
  "hasPastSurgeries",
  "recentAnxiety",
  "recentDepression",
  "maritalStatus",
];

export const medicalReportMaxSize = 5 * 1024 * 1024; // 5MB
export const allowedMedicalReportFormats = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
