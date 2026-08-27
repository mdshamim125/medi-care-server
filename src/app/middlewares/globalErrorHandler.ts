import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

// Sanitize error to prevent exposing sensitive information in production
const sanitizeError = (error: any) => {
  // Don't expose Prisma errors in production
  if (process.env.NODE_ENV === "production" && error.code?.startsWith("P")) {
    return {
      message: "Database operation failed",
      errorDetails: null,
    };
  }
  return error;
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log({ err });

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error";
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Duplicate Key error";
      error = err.meta;
    }
  }

  // Sanitize error before sending response
  const sanitizedError = sanitizeError(error);

  res.status(statusCode).json({
    success,
    message,
    error: sanitizedError,
  });
};

export default globalErrorHandler;

// import { Prisma } from "@prisma/client";
// import { NextFunction, Request, Response } from "express";
// import httpStatus from "http-status";

// const globalErrorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   console.log(err);
//   let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
//   let success = false;
//   let message = err.message || "Something went wrong!";
//   let error = err;

//   if (err instanceof Prisma.PrismaClientKnownRequestError) {
//     if (err.code === "P2002") {
//       ((message = "Duplicate key error"),
//         (error = err.meta),
//         (statusCode = httpStatus.CONFLICT));
//     }
//     if (err.code === "P1000") {
//       ((message = "Authentication failed against database server"),
//         (error = err.meta),
//         (statusCode = httpStatus.BAD_GATEWAY));
//     }
//     if (err.code === "P2003") {
//       ((message = "Foreign key constraint failed"),
//         (error = err.meta),
//         (statusCode = httpStatus.BAD_REQUEST));
//     }
//   } else if (err instanceof Prisma.PrismaClientValidationError) {
//     ((message = "Validation Error"),
//       (error = err.message),
//       (statusCode = httpStatus.BAD_REQUEST));
//   } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
//     ((message = "Unknown Prisma error occured!"),
//       (error = err.message),
//       (statusCode = httpStatus.BAD_REQUEST));
//   } else if (err instanceof Prisma.PrismaClientInitializationError) {
//     ((message = "Prisma client failed to initialize!"),
//       (error = err.message),
//       (statusCode = httpStatus.BAD_REQUEST));
//   }

//   res.status(statusCode).json({
//     success,
//     message,
//     error,
//   });
// };

// export default globalErrorHandler;
