import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { apiResponse } from "../service/response";
import { HTTP_RESPONSE } from "../utils/statusCodes";

export const validateRequest =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    console.log("result::", result);

    if (!result.success) {
      return apiResponse(
        res,
        "Validation failed",
        HTTP_RESPONSE.BAD_REQUEST.code,
        result.error,
      );
    }

    req.body = result.data;
    next();
  };
