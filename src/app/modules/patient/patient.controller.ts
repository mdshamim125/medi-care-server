import { Request, Response } from "express";
import httpStatus from "http-status";
import { patientFilterableFields } from "./patient.constant";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helpers/pick";
import { PatientService } from "./patient.service";
import sendResponse from "../../shared/sendResponse";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await PatientService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.getByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieval successfully",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.updateIntoDB(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.softDelete(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient soft deleted successfully",
    data: result,
  });
});

// Patient-specific controllers
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;

  const result = await PatientService.getMyProfile(email as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient profile retrieved successfully",
    data: result,
  });
});

const getMyHealthData = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;

  const result = await PatientService.getMyHealthData(email as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient health data retrieved successfully",
    data: result,
  });
});

const getMyMedicalReports = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;

  const result = await PatientService.getMyMedicalReports(email as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medical reports retrieved successfully",
    data: result,
  });
});

const deleteMyMedicalReport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PatientService.deleteMyMedicalReport(
      req.user?.email as string,
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Medical report deleted successfully",
      data: result,
    });
  },
);

const getDoctorPaidPatients = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.user?.email;

    const result = await PatientService.getDoctorPaidPatients(email as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor paid patients retrieved successfully",
      data: result,
    });
  },
);

const getDoctorPatientById = catchAsync(async (req: Request, res: Response) => {
  const result = await PatientService.getDoctorPatientById(
    req.user?.email as string,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor patient retrieved successfully",
    data: result,
  });
});

const updateMyHealthData = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;

  const result = await PatientService.updateMyHealthData(
    email as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Health data updated successfully",
    data: result,
  });
});

const uploadMedicalReport = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email;
  const file = req.file;

  const result = await PatientService.uploadMedicalReport(
    email as string,
    req.body,
    file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Medical report uploaded successfully",
    data: result,
  });
});

export const PatientController = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
  getMyProfile,
  getMyHealthData,
  getMyMedicalReports,
  deleteMyMedicalReport,
  getDoctorPaidPatients,
  getDoctorPatientById,
  updateMyHealthData,
  uploadMedicalReport,
};
