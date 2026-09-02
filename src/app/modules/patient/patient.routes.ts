import express, { NextFunction, Request, Response } from "express";
import { PatientController } from "./patient.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helpers/fileUploader";
import { MedicalReportUploadValidationSchema } from "./patient.validations";

const router = express.Router();

// Patient routes - for authenticated patients viewing their own data
router.get(
  "/my-profile",
  auth(UserRole.PATIENT),
  PatientController.getMyProfile,
);

router.get(
  "/my-health-data",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  PatientController.getMyHealthData,
);

router.get(
  "/my-medical-reports",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  PatientController.getMyMedicalReports,
);

router.get(
  "/my-paid-patients",
  auth(UserRole.DOCTOR),
  PatientController.getDoctorPaidPatients,
);

router.get(
  "/doctor-patient/:id",
  auth(UserRole.DOCTOR),
  PatientController.getDoctorPatientById,
);

router.patch(
  "/update-health-data",
  auth(UserRole.PATIENT),
  PatientController.updateMyHealthData,
);

router.post(
  "/upload-medical-report",
  auth(UserRole.PATIENT),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = MedicalReportUploadValidationSchema.parse(
        JSON.parse(req.body.data),
      );
      return PatientController.uploadMedicalReport(req, res, next);
    } catch (error) {
      return next(error);
    }
  },
);

// Admin routes
router.get("/", auth(UserRole.ADMIN), PatientController.getAllFromDB);

router.get("/:id", auth(UserRole.ADMIN), PatientController.getByIdFromDB);

router.patch("/:id", auth(UserRole.ADMIN), PatientController.updateIntoDB);

router.delete("/:id", auth(UserRole.ADMIN), PatientController.deleteFromDB);

router.delete("/soft/:id", auth(UserRole.ADMIN), PatientController.softDelete);

export const PatientRoutes = router;
