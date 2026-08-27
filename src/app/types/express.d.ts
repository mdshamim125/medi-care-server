import { IJWTPayload } from "../app/modules/auth/auth.interface";
// adjust the path if IJWTPayload is located somewhere else

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export {};
