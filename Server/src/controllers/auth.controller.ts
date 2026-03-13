import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dbOperation } from "../service/dbOperation";
import { UserData } from "../types/authTypes";
import { env } from "../config/env";
import { apiResponse } from "../service/response";
import { HTTP_RESPONSE } from "../utils/statusCodes";
import { VALIDATION_MESSAGES } from "../utils/validationMessages";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as UserData;

  const hashed = await bcrypt.hash(password, 10);

  const user = await dbOperation("user", "create", undefined, {
    name,
    email,
    password: hashed,
  });

  // Generate access token
  const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });

  // Generate refresh token
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  // Store refresh token in database (you might want to add a refreshTokens table)
  await dbOperation(
    "user",
    "update",
    { id: user.id },
    {
      refreshToken: refreshToken,
    },
  );

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  return apiResponse(
    res,
    "User registered successfully",
    HTTP_RESPONSE.OK.code,
    {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
  );
};

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await dbOperation("user", "findUnique", { email });

  // Generate access token
  const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });

  // Generate refresh token
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  // Store refresh token in database
  await dbOperation("user", "update", { id: user.id });

  await dbOperation("refreshToken", "create", undefined, {
    userId: user.id,
    token: refreshToken,
  });

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;

  return apiResponse(res, "Login successful", HTTP_RESPONSE.OK.code, {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  });
};

export const getLoginUser = async (req: any, res: Response) => {
  const user = await dbOperation("user", "findUnique", { id: req.userId });

  // Remove password from user object
  const {
    password: _,
    refreshToken: __,
    ...userWithoutSensitiveData
  } = user || {};

  return apiResponse(res, HTTP_RESPONSE.OK.message, HTTP_RESPONSE.OK.code, {
    user: userWithoutSensitiveData,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return apiResponse(
      res,
      VALIDATION_MESSAGES.REQUIRED("Refresh token"),
      HTTP_RESPONSE.BAD_REQUEST.code,
    );
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET!) as any;
    const user = await dbOperation("user", "findUnique", {
      id: decoded.userId,
    });

    if (!user || user.refreshToken !== refreshToken) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.INVALID("Refresh token"),
        HTTP_RESPONSE.UNAUTHORIZED.code,
      );
    }

    const newAccessToken = jwt.sign(
      { userId: user.id },
      env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    return apiResponse(res, HTTP_RESPONSE.OK.message, HTTP_RESPONSE.OK.code, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return apiResponse(
      res,
      VALIDATION_MESSAGES.INVALID("Refresh token"),
      HTTP_RESPONSE.UNAUTHORIZED.code,
    );
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return apiResponse(
      res,
      VALIDATION_MESSAGES.REQUIRED("Refresh token"),
      HTTP_RESPONSE.BAD_REQUEST.code,
    );
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET!) as any;

    await dbOperation(
      "user",
      "update",
      { id: decoded.userId },
      {
        refreshToken: null,
      },
    );

    return apiResponse(res, "Logout successful", HTTP_RESPONSE.OK.code);
  } catch (error) {
    return apiResponse(
      res,
      VALIDATION_MESSAGES.INVALID("Refresh token"),
      HTTP_RESPONSE.UNAUTHORIZED.code,
    );
  }
};
