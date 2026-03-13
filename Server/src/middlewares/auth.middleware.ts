import { Request, Response, NextFunction } from "express";
import { RefreshTokenService } from "../service/refreshTokenService";
import { apiResponse } from "../service/response";
import { AuthenticatedRequest } from "../types/authTypes";
import { VALIDATION_MESSAGES } from "../utils/validationMessages";
import { HTTP_RESPONSE } from "../utils/statusCodes";
import { logger } from "../config/logger";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = req.headers["x-refresh-token"] as string;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Access token"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
      return;
    }

    const token = authHeader.substring(7);

    // Verify refresh token exists and is valid
    if (!refreshToken) {
      apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Refresh token"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
      return;
    }

    const tokenData =
      await RefreshTokenService.verifyRefreshToken(refreshToken);

    if (!tokenData || tokenData.isRevoked) {
      apiResponse(
        res,
        VALIDATION_MESSAGES.INVALID("Refresh token"),
        HTTP_RESPONSE.UNAUTHORIZED.code,
      );
      return;
    }

    // Attach user info to request
    req.user = {
      id: tokenData.userId,
      email: tokenData.user.email,
    };

    next();
  } catch (error) {
    logger.error("Authentication error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      headers: req.headers,
      ip: req.ip,
    });
    apiResponse(
      res,
      VALIDATION_MESSAGES.INVALID("Authentication"),
      HTTP_RESPONSE.UNAUTHORIZED.code,
    );
  }
};
