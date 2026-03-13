export const HTTP_RESPONSE = {
  OK: {
    code: 200,
    message: "Request successful",
  },
  CREATED: {
    code: 201,
    message: "Resource created successfully",
  },
  ACCEPTED: {
    code: 202,
    message: "Request accepted",
  },
  NO_CONTENT: {
    code: 204,
    message: "No content available",
  },

  BAD_REQUEST: {
    code: 400,
    message: "Bad request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized access",
  },
  FORBIDDEN: {
    code: 403,
    message: "Access forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found",
  },
  METHOD_NOT_ALLOWED: {
    code: 405,
    message: "Method not allowed",
  },
  CONFLICT: {
    code: 409,
    message: "Resource conflict",
  },
  UNPROCESSABLE_ENTITY: {
    code: 422,
    message: "Unprocessable entity",
  },

  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal server error",
  },
  BAD_GATEWAY: {
    code: 502,
    message: "Bad gateway",
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: "Service unavailable",
  },
  GATEWAY_TIMEOUT: {
    code: 504,
    message: "Gateway timeout",
  },
};
