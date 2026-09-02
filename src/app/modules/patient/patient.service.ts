import { Patient, PaymentStatus, Prisma, UserStatus } from "@prisma/client";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { paginationHelper } from "../../helpers/paginationHelper";
import { patientSearchableFields } from "./patient.constant";
import { prisma } from "../../shared/prisma";

const getAllFromDB = async (
  filters: IPatientFilterRequest,
  options: IPaginationOptions,
  includeHealthData: boolean = false, // NEW PARAMETER
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Conditional include based on parameter
  const includeClause = includeHealthData
    ? {
        medicalReport: true,
        patientHealthData: true,
      }
    : {
        medicalReport: {
          select: {
            id: true,
            reportName: true,
            createdAt: true,
          },
        },
      };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: includeClause,
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  return result;
};

const updateIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>,
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    //update patient data
    await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    // create or update patient health data
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }

    if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
  return responseData;
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (tx) => {
    // delete medical report
    await tx.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    // delete patient health data
    await tx.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    const deletedPatient = await tx.patient.delete({
      where: {
        id,
      },
    });

    await tx.user.delete({
      where: {
        email: deletedPatient.email,
      },
    });

    return deletedPatient;
  });

  return result;
};

const softDelete = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
};

// Patient-specific service methods
const getMyProfile = async (email: string) => {
  const result = await prisma.patient.findUnique({
    where: {
      email,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      profilePhoto: true,
      contactNumber: true,
      address: true,
      createdAt: true,
      updatedAt: true,
      patientHealthData: true,
      medicalReport: {
        select: {
          id: true,
          reportName: true,
          reportLink: true,
          createdAt: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Patient not found");
  }

  return result;
};

const getMyHealthData = async (email: string) => {
  const patient = await prisma.patient.findUnique({
    where: {
      email,
      isDeleted: false,
    },
    select: {
      id: true,
      patientHealthData: true,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient.patientHealthData;
};

const getMyMedicalReports = async (email: string) => {
  const patient = await prisma.patient.findUnique({
    where: {
      email,
      isDeleted: false,
    },
    select: {
      id: true,
      medicalReport: {
        select: {
          id: true,
          reportName: true,
          reportLink: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient.medicalReport;
};

const getDoctorPaidPatients = async (doctorEmail: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      email: doctorEmail,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      paymentStatus: PaymentStatus.PAID,
    },
    select: {
      patient: {
        select: {
          id: true,
          email: true,
          name: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          patientHealthData: true,
          medicalReport: {
            select: {
              id: true,
              reportName: true,
              reportLink: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  const uniquePatients = new Map<string, any>();

  appointments.forEach(({ patient }) => {
    if (patient && !uniquePatients.has(patient.id)) {
      uniquePatients.set(patient.id, patient);
    }
  });

  return [...uniquePatients.values()];
};

const getDoctorPatientById = async (doctorEmail: string, patientId: string) => {
  const appointment = await prisma.appointment.findFirst({
    where: {
      patientId,
      paymentStatus: PaymentStatus.PAID,
      doctor: { email: doctorEmail, isDeleted: false },
    },
    select: { patientId: true },
  });

  if (!appointment) {
    throw new Error("Patient not found in your appointments");
  }

  return prisma.patient.findUnique({
    where: { id: appointment.patientId, isDeleted: false },
    include: {
      patientHealthData: true,
      medicalReport: { orderBy: { createdAt: "desc" } },
      appointment: {
        where: { doctor: { email: doctorEmail } },
        include: { schedule: true, prescription: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const updateMyHealthData = async (email: string, payload: any) => {
  const patient = await prisma.patient.findUnique({
    where: {
      email,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const result = await prisma.patientHealthData.upsert({
    where: {
      patientId: patient.id,
    },
    update: payload,
    create: {
      ...payload,
      patientId: patient.id,
    },
  });

  return result;
};

const uploadMedicalReport = async (
  email: string,
  payload: any,
  file: Express.Multer.File | undefined,
) => {
  if (!file) {
    throw new Error("File is required");
  }

  const patient = await prisma.patient.findUnique({
    where: {
      email,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const result = await prisma.medicalReport.create({
    data: {
      patientId: patient.id,
      reportName: payload.reportName || file.originalname,
      reportLink: `/uploads/${file.filename}`,
    },
  });

  return result;
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
  getMyProfile,
  getMyHealthData,
  getMyMedicalReports,
  getDoctorPaidPatients,
  getDoctorPatientById,
  updateMyHealthData,
  uploadMedicalReport,
};
