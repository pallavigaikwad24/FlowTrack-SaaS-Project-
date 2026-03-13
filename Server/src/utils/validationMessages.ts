export const VALIDATION_MESSAGES = {
  INVALID: (field: string) => `Please enter a valid ${field}`,

  PASSWORD_WEAK:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",

  REQUIRED: (field: string) => `${field} is required`,

  EXISTS: (field: string) => `${field} already exists`,
  NOT_EXISTS: (field: string) => `${field} does not exist`,
  NOT_MATCH: (field: string) => `${field} does not match`,
  EXPIRED: (field: string) => `${field} has expired`,
  CREATED: (field: string) => `${field} created successfully`,
  FAILED: (action: string) => `Failed to ${action}`,
  ADMIN_ONLY_INVITE: "Only admins can invite members",
};
