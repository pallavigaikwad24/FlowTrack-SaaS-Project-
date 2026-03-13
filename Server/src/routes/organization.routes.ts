import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  inviteMember,
  getMembers,
} from "../controllers/organization.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validationRequest";
import { createOrganizationSchema, inviteMemberSchema } from "../middlewares/organization.validation";

const router = Router();

// All organization routes are protected
router.use(authenticateToken);

// POST /organizations
router.post("/", validateRequest(createOrganizationSchema), createOrganization);

// GET /organizations
router.get("/", getOrganizations);

// GET /organizations/:id
router.get("/:id", getOrganization);

// POST /organizations/:id/invite
router.post("/:id/invite", validateRequest(inviteMemberSchema), inviteMember);

// GET /organizations/:id/members
router.get("/:id/members", getMembers);

export default router;
