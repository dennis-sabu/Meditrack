import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DefinedError } from "./error";
import { Maybe, TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { typeToFlattenedError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
type TryResult<T> =
  | {
    error: null;
    data: T;
    isSuccess: true;
  }
  | {
    error: DefinedError;
    data: null;
    isSuccess: false;
  };

export const trys = <T>(func: () => T): TryResult<T> => {
  try {
    const data = func() as T;
    return { error: null, data, isSuccess: true };
  } catch (e) {
    return {
      error: DefinedError.convert(e),
      data: null,
      isSuccess: false,
    };
  }
};
export const triedAsync = <T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<
  | {
    data: undefined;
    error: U;
    isSuccess: false;
    zodErrors?: string[]; // Flattened errors
    fieldErrors?: Record<string, string[]>; // Raw field-level error map
  }
  | {
    data: T;
    error: undefined;
    isSuccess: true;
  }
> =>
  promise
    .then((data: T) => ({
      data,
      error: undefined,
      isSuccess: true as const,
    }))
    .catch((err) => {
      const result = {
        error: err,
        data: undefined,
        fieldErrors: undefined as Record<string, string[]> | undefined,
        zodErrors: undefined as string[] | undefined,
        isSuccess: false as const,
      };

      if (errorExt) {
        result.error = Object.assign({}, err, errorExt);
      }
      
      // Check for tRPC ZodError structure
      const zodError = err?.data?.zodError;
      if (zodError?.fieldErrors || zodError?.formErrors) {
        result.zodErrors = [
          ...(zodError.formErrors || []),
          ...Object.values(zodError.fieldErrors || {}).flat(),
        ];
        result.fieldErrors = zodError.fieldErrors || {};
      }
      return result;
    });

export function capitalizeSentence(sentence: string) {
  return sentence
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


export function capitalizeComplexWords(text: string) {
  return text
    .split(/[\s-_]+/) // Split on spaces, hyphens, or underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// console.log(capitalizeComplexWords("hello-world_from js"));
// Output: Hello World From Js

export function formatEnum(enumValue: string) {
  return enumValue
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// console.log(formatEnum("general_contractor")); 


export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if ((localPart?.length ?? 0) <= 2) {
    return `${(localPart ?? '')[0]}******@${domain}`;
  }

  const visible = (localPart ?? '').slice(0, 2);
  return `${visible}******@${domain}`;
}

export function isValidPhoneNumber(phone: string) {
  const sanitizedPhone = phone.replace(/\s+/g, ''); // Remove spaces

  // Basic regex: optional +, and 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(sanitizedPhone)) return false;

  const digits = sanitizedPhone.replace(/^\+/, ''); // remove '+' if present

  // Check for repeated digits (e.g., 1111111111)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Check for sequential increasing or decreasing patterns
  const isSequential = (str: string) => {
    const increasing = '01234567890123456789';
    const decreasing = '98765432109876543210';
    return increasing.includes(str) || decreasing.includes(str);
  };

  if (isSequential(digits)) return false;

  return true;
}

export function getUsernameFromEmail(email: string) {
  if (typeof email !== 'string') return null;
  const parts = email.trim().split('@');
  return parts.length > 1 ? parts[0] : null;
}
