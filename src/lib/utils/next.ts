import { notFound, redirect, unauthorized } from "next/navigation";
import { type NextRequest, type NextResponse } from "next/server";
import { type ReactElement } from "react";
import { type z } from "zod";

import { type ClearObject, type EmptyObject, type Nothing } from "./types";

type PropValueAsString<T, TPropName extends string, WithPartial extends boolean = true> = [T] extends [
  infer R extends string,
]
  ? "" extends R
    ? EmptyObject
    : {
        [P in TPropName]: Promise<
          WithPartial extends true ? Partial<Record<R, string[] | string>> : Record<R, string[] | string>
        >;
      }
  : never;

type PropValueAsObject<T, TPropName extends string, WithPartial extends boolean = true> = T extends z.ZodType
  ? never
  : T extends object
    ? {
        [P in TPropName]: Promise<WithPartial extends true ? Partial<T> : T>;
      }
    : never;

type PropValueAsZod<T, TPropName extends string> = T extends z.ZodType
  ? {
      [P in `${TPropName}Error`]?: z.typeToFlattenedError<z.infer<T>>;
    } & {
      [P in TPropName]: Promise<ClearObject<z.infer<T>>>;
    }
  : never;

export type NextServerPageProps<
  Params extends z.ZodType | object | string = string,
  SearchParams extends z.ZodType | object | string = never,
> = (
  | PropValueAsObject<Params, "params", false>
  | PropValueAsString<Params, "params", false>
  | PropValueAsZod<Params, "params">
) &
  (
    | PropValueAsObject<SearchParams, "searchParams">
    | PropValueAsString<SearchParams, "searchParams">
    | PropValueAsZod<SearchParams, "searchParams">
  );

interface ValidationOptionsWithNotFound {
  notFound: true;
  redirect?: never;
}
interface ValidationOptionsWithRedirect {
  notFound?: never;
  redirect: Parameters<typeof redirect>;
}
export type ValidationOptions = ValidationOptionsWithNotFound | ValidationOptionsWithRedirect;

type ZodNextPage<
  Params extends z.ZodType | object | string = string,
  SearchParams extends z.ZodType | object | string = never,
> = (props: NextServerPageProps<Params, SearchParams>) => Promise<ReactElement> | ReactElement;

export const withValidation =
  <Params extends z.ZodType, SearchParams extends z.ZodType, TPage extends ZodNextPage<Params, SearchParams>>(
    schemas: { paramsSchema?: Params; searchParamsSchema?: SearchParams },
    options?: ValidationOptions,
  ) =>
  (page: TPage): (() => ReactElement) =>
  // @ts-expect-error - This is a hack to make the types work
  async (props: NextServerPageProps<Params, SearchParams>) => {
    const { paramsSchema, searchParamsSchema } = schemas;
    const newProps = { ...props } as PropValueAsZod<Params, "params"> & PropValueAsZod<SearchParams, "searchParams">;
    if (paramsSchema) {
      const parseResult = await paramsSchema.safeParseAsync(await newProps.params);
      if (!parseResult.success) {
        if (options?.notFound) {
          unauthorized();
          // notFound();
        }
        if (options?.redirect) {
          redirect(...options.redirect);
        }

        newProps.paramsError = parseResult.error.flatten();
      } else {
        newProps.params = Promise.resolve(parseResult.data) as never;
      }
    }

    if (searchParamsSchema) {
      const parseResult = await searchParamsSchema.safeParseAsync(await newProps.searchParams);
      if (!parseResult.success) {
        if (options?.notFound) {
          notFound();
        }
        if (options?.redirect) {
          redirect(...options.redirect);
        }

        newProps.searchParamsError = parseResult.error.flatten();
      } else {
        newProps.searchParams = Promise.resolve(parseResult.data) as never;
      }
    }
    return page(newProps);
  };

export type NextRouteHandler<TParams extends string = string> = (
  req: NextRequest,
  context: {
    params: {
      [T in TParams as T extends `...${infer R extends string}` ? R : T]: T extends `...${string}` ? string[] : string;
    };
  },
) => NextResponse | Promise<NextResponse | Response> | Response;

/**
 * Wrap Next.js server action response to avoid bubbling up errors
 */
export type ServerActionResponse<TData = void, TError = string> =
  | { error: TError; ok: false }
  | ((TData extends Nothing ? EmptyObject : { data: TData }) & {
      ok: true;
    });

const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";
export interface NextError extends Error {
  digest?: string;
}
enum RedirectStatusCode {
  SeeOther = 303,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
}
export function isRedirectError(error: NextError): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error) || typeof error.digest !== "string") {
    return false;
  }
  const digest = error.digest.split(";");
  const [errorCode, type] = digest;
  const destination = digest.slice(2, -2).join(";");
  const status = digest.at(-2);
  const statusCode = Number(status);
  return (
    errorCode === REDIRECT_ERROR_CODE &&
    (type === "replace" || type === "push") &&
    typeof destination === "string" &&
    !isNaN(statusCode) &&
    statusCode in RedirectStatusCode
  );
}
