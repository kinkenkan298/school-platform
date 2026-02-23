import { StatusCodes } from "http-status-codes";

export { StatusCodes };

export type ApiResponseParams<T> = {
  success: boolean;
  message: string;
  statusCode: StatusCodes;
  data?: T | null;
  errors?: unknown;
};
