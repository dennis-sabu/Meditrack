import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import { sql } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

export const Increment = (column: AnyPgColumn, value = 1) => {
  return sql`${column} + ${value}`;
};

export const Decrement = (column: AnyPgColumn, value = 1) => {
  return sql`${column} - ${value}`;
};

type ErrorList = {
  [k in string]: {
    message: string;
    code: TRPC_ERROR_CODE_KEY;
  };
};
export const errorList = {
  NOT_LOGGED_IN: {
    message: 'You are not logged in',
    code: 'UNAUTHORIZED',
  },
  NOT_AUTHORIZED: {
    message: 'You are not authorized to access this action/route',
    code: 'UNAUTHORIZED',
  },
  TRANSACTION_NOT_FOUND: {
    message: 'Transaction not found or not initilized yet',
    code: 'NOT_FOUND',
  },
  PAYMENT_INITIALISATION_FAILED: {
    message: 'Payment initialisation failed',
    code: 'BAD_GATEWAY',
  },
  PAYMENT_VERIFICATION_FAILED: {
    message: 'Payment verification failed',
    code: 'NOT_FOUND',
  },
  TRANSACTION_FAILED: {
    message: 'Transaction has been failed',
    code: 'CLIENT_CLOSED_REQUEST',
  },
  USER_DETAILS_INCOMPLETE: {
    message: 'User details are incomplete to initiate a transaction',
    code: 'PRECONDITION_FAILED',
  },
  USER_NOT_FOUND: {
    message: 'User details are incomplete or not exist',
    code: 'NOT_FOUND',
  },
  USER_HAS_NO_SUCCESSFUL_PAYMENTS: {
    message: "User doen't have any successfull payments",
    code: 'NOT_FOUND',
  },
} satisfies ErrorList;

export const getTrpcError = (key: keyof typeof errorList, error?: Error) => {
  const currentError = errorList[key];
  return new TRPCError({
    code: currentError?.code ?? 'INTERNAL_SERVER_ERROR',
    message: currentError?.message ?? 'Wrong Error found',
    cause: error,
  });
};