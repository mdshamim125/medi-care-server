import { Request, Response } from "express";
import { MetaService } from "./meta.service";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/catchAsync";

const fetchDashboardMetaData = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const result = await MetaService.fetchDashboardMetaData(user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta data retrival successfully!",
      data: result,
    });
  },
);

export const MetaController = {
  fetchDashboardMetaData,
};
