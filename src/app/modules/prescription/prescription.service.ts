import { AppointmentStatus, Prescription, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { prisma } from "../../shared/prisma";
import { paginationHelper } from "../../helpers/paginationHelper";

const insertIntoDB = async (
  user: IAuthUser,
  payload: Partial<Prescription>,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      // paymentStatus: PaymentStatus.PAID
    },
    include: {
      doctor: true,
    },
  });

  if (user?.email !== appointmentData.doctor.email) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This is not your appointment!",
    );
  }

  // healthIssue is mandatory
  if (!payload.healthIssue) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Health issue is required!",
    );
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,

      healthIssue: payload.healthIssue,
      givenTest: payload.givenTest || null,

      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return result;
};

const patientPrescription = async (
  user: IAuthUser,
  filters: { searchTerm?: string; followUp?: string },
  options: IPaginationOptions,
) => {
  if (!user?.email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
  }

  const { limit, page, skip } =
    paginationHelper.calculatePagination(options);

  const andConditions: Prisma.PrescriptionWhereInput[] = [
    user.role === "DOCTOR"
      ? { doctor: { email: user.email } }
      : { patient: { email: user.email } },
  ];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        {
          healthIssue: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
        {
          patient: {
            is: {
              OR: [
                {
                  name: {
                    contains: filters.searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: filters.searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ],
    });
  }

  if (filters.followUp === "scheduled") {
    andConditions.push({ followUpDate: { not: null } });
  } else if (filters.followUp === "none") {
    andConditions.push({ followUpDate: null });
  }

  const whereConditions: Prisma.PrescriptionWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.prescription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  const total = await prisma.prescription.count({
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

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(options);

  const { patientEmail, doctorEmail } = filters;

  const andConditions: Prisma.PrescriptionWhereInput[] = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  }

  if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
    });
  }

  const whereConditions: Prisma.PrescriptionWhereInput =
    andConditions.length > 0
      ? { AND: andConditions }
      : {};

  const result = await prisma.prescription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  const total = await prisma.prescription.count({
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

export const PrescriptionService = {
  insertIntoDB,
  patientPrescription,
  getAllFromDB,
};