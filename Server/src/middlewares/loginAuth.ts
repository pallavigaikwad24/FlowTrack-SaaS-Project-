import { z } from "zod";
import { VALIDATION_MESSAGES } from "../utils/validationMessages";
import { dbOperation } from "../service/dbOperation";
import bcrypt from "bcrypt";

export const loginSchema = z
  .object({
    email: z.email(VALIDATION_MESSAGES.INVALID("email")).trim(),

    password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("Password")),
  })
  .superRefine(async (data, ctx) => {
    const { email, password } = data;

    const user = await dbOperation("user", "findUnique", { email });

    if (!user) {
      ctx.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.NOT_EXISTS("Email"),
        path: ["email"],
      });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      ctx.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.INVALID("Password"),
        path: ["password"],
      });
    }
  });

export const registerSchema = z
  .object({
    name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED("Name")).trim(),
    email: z.email(VALIDATION_MESSAGES.INVALID("email")).trim(),
    password: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED("Password"))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        VALIDATION_MESSAGES.PASSWORD_WEAK,
      ),

    confirmPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED("Confirm Password")),
  })
  .superRefine(async (data, ctx) => {
    const { email, password, confirmPassword } = data;

    // Check if email already exists
    const user = await dbOperation("user", "findUnique", { email });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.EXISTS("Email"),
        path: ["email"],
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.NOT_MATCH("Password"),
        path: ["confirmPassword"],
      });
    }
    return;
  });
