import { Response } from "express";
import { dbOperation } from "../service/dbOperation";
import { apiResponse } from "../service/response";
import { AuthenticatedRequest } from "../types/authTypes";
import { VALIDATION_MESSAGES } from "../utils/validationMessages";
import { HTTP_RESPONSE } from "../utils/statusCodes";
import { logger } from "../config/logger";

export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Organization name"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
    }

    const org = await dbOperation("organization", "create", undefined, {
      name,
      ownerId: req.user!.id,
    });

    await dbOperation("membership", "create", undefined, {
      userId: req.user!.id,
      organizationId: org.id,
      role: "admin",
    });

    apiResponse(
      res,
      VALIDATION_MESSAGES.CREATED("Organization"),
      HTTP_RESPONSE.CREATED.code,
      org,
    );
  } catch (error) {
    logger.error("Create organization error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      body: req.body,
    });
    apiResponse(
      res,
      VALIDATION_MESSAGES.FAILED("create organization"),
      HTTP_RESPONSE.INTERNAL_SERVER_ERROR.code,
    );
  }
};

export const getOrganizations = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const orgs = await dbOperation(
      "membership",
      "findMany",
      { userId: req.user!.id },
      undefined,
      { organization: true },
    );

    apiResponse(
      res,
      "Organizations retrieved successfully",
      HTTP_RESPONSE.OK.code,
      orgs,
    );
  } catch (error) {
    logger.error("Get organizations error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
    });
    apiResponse(
      res,
      "Failed to retrieve organizations",
      HTTP_RESPONSE.INTERNAL_SERVER_ERROR.code,
    );
  }
};

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Organization ID"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
    }

    const org = await dbOperation(
      "organization",
      "findUnique",
      { id: id as string },
      undefined,
      {
        projects: true,
      },
    );

    if (!org) {
      return apiResponse(
        res,
        HTTP_RESPONSE.NOT_FOUND.message,
        HTTP_RESPONSE.NOT_FOUND.code,
      );
    }

    apiResponse(res, HTTP_RESPONSE.OK.message, HTTP_RESPONSE.OK.code, org);
  } catch (error) {
    logger.error("Get organization error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      organizationId: req.params.id,
    });
    apiResponse(
      res,
      VALIDATION_MESSAGES.FAILED("retrieve organization"),
      HTTP_RESPONSE.INTERNAL_SERVER_ERROR.code,
    );
  }
};

export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { userId, role = "member" } = req.body;

    if (!id || !userId) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Organization ID and user ID"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
    }

    // Check if user is admin of the organization
    const membership = await dbOperation("membership", "findFirst", {
      organizationId: id as string,
      userId: req.user!.id,
      role: "admin",
    });

    if (!membership) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.ADMIN_ONLY_INVITE,
        HTTP_RESPONSE.FORBIDDEN.code,
      );
    }

    const member = await dbOperation("membership", "create", undefined, {
      userId,
      organizationId: id as string,
      role,
    });

    apiResponse(
      res,
      HTTP_RESPONSE.CREATED.message,
      HTTP_RESPONSE.CREATED.code,
      member,
    );
  } catch (error) {
    logger.error("Invite member error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      organizationId: req.params.id,
      body: req.body,
    });
    apiResponse(res, "Failed to invite member", 500);
  }
};

export const getMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse(
        res,
        VALIDATION_MESSAGES.REQUIRED("Organization ID"),
        HTTP_RESPONSE.BAD_REQUEST.code,
      );
    }

    // Check if user is a member of the organization
    const membership = await dbOperation("membership", "findFirst", {
      organizationId: id as string,
      userId: req.user!.id,
    });

    if (!membership) {
      return apiResponse(
        res,
        HTTP_RESPONSE.FORBIDDEN.message,
        HTTP_RESPONSE.FORBIDDEN.code,
      );
    }

    const members = await dbOperation(
      "membership",
      "findMany",
      { organizationId: id as string },
      undefined,
      { user: true },
    );

    apiResponse(res, HTTP_RESPONSE.OK.message, HTTP_RESPONSE.OK.code, members);
  } catch (error) {
    logger.error("Get members error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      organizationId: req.params.id,
    });
    apiResponse(res, "Failed to retrieve members", 500);
  }
};
