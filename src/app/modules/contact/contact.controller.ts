import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ContactService } from "./contact.service";

const submitInquiry = catchAsync(async (req: Request, res: Response) => {
  await ContactService.submitInquiry(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your message has been sent successfully.",
    data: { accepted: true },
  });
});

export const ContactController = {
  submitInquiry,
};
