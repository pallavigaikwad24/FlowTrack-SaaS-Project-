import { prisma } from "../config/prisma";
import { PrismaClient } from "@prisma/client";
import { OperationName } from "../types/dbType";

type PrismaModel = keyof PrismaClient;

export async function dbOperation(
  dbName: PrismaModel,
  operationName: OperationName,
  whereCon?: Record<string, any>,
  otherData?: Record<string, any>,
  include?: Record<string, boolean>,
) {
  const model = prisma[dbName];
  const operationParams: any = {};

  if (whereCon) operationParams.where = whereCon;

  if (otherData) operationParams.data = otherData;

  if (include) operationParams.include = include;
  const result = await model[operationName](operationParams);
  return result;
}
