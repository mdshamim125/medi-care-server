import { Admin, Prisma, UserRole, UserStatus } from "@prisma/client";
import httpStatus from "http-status";
import { adminSearchAbleFields } from "./admin.constant";
import { IAdminFilterRequest } from "./admin.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const getAllFromDB = async (params: IAdminFilterRequest, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.AdminWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: adminSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andCondions.push({
    isDeleted: false,
  });

  //console.dir(andCondions, { depth: 'inifinity' })
  const whereConditons: Prisma.AdminWhereInput = { AND: andCondions };

  const result = await prisma.admin.findMany({
    where: whereConditons,
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
  });

  const total = await prisma.admin.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  return result;
};

const updateIntoDB = async (
  id: string,
  data: Partial<Admin>,
): Promise<Admin> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });

  return result;
};

const ensureAdminCanBeDeleted = async (
  id: string,
  requesterEmail?: string,
  requesterRole?: UserRole,
) => {
  if (requesterRole !== UserRole.SUPER_ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only super admin can delete admins",
    );
  }

  const admin = await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
    include: { user: true },
  });

  if (admin.email === requesterEmail) {
    throw new ApiError(httpStatus.FORBIDDEN, "You cannot delete yourself");
  }

  if (admin.user.role === UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "Super admin cannot be deleted");
  }
};

const deleteFromDB = async (
  id: string,
  requesterEmail?: string,
  requesterRole?: UserRole,
): Promise<Admin | null> => {
  await ensureAdminCanBeDeleted(id, requesterEmail, requesterRole);

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });

    return adminDeletedData;
  });

  return result;
};

const softDeleteFromDB = async (
  id: string,
  requesterEmail?: string,
  requesterRole?: UserRole,
): Promise<Admin | null> => {
  await ensureAdminCanBeDeleted(id, requesterEmail, requesterRole);
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: adminDeletedData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return adminDeletedData;
  });

  return result;
};

export const AdminService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDeleteFromDB,
};
