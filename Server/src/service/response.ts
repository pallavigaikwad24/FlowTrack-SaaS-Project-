import { Response } from "express";

export const apiResponse = (
  res: Response,
  message: string,
  statusCode: number,
  data?: unknown,
) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 400 ? true : false,
    message,
    data: data || null,
  });
};
