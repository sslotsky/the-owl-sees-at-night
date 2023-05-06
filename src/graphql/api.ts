import type { QRL } from "@builder.io/qwik";
import { $, useStore } from "@builder.io/qwik";
import type { RequestEventCommon } from "@builder.io/qwik-city";
import { server$ } from "@builder.io/qwik-city";
import { isBrowser } from "@builder.io/qwik/build";
import { parse, serialize } from "cookie";
import type { DocumentNode } from "graphql";
import { print } from "graphql";
import { getSdk } from "~/generated/graphql";
// import { parse } from "cookie";

export const AUTH_TOKEN_KEY = "vendure-auth-token";

interface StringCompatible {
  toString(): string;
}

export const gql = (str: TemplateStringsArray, ...values: StringCompatible[]) =>
  str.reduce((result, s, i) => `${result}${s}${values[i] || ""}`, "");

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function requester<R, V>(
  doc: DocumentNode,
  vars?: V,
  options: { token?: string } = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isBrowser) {
    const token = parse(document.cookie)[AUTH_TOKEN_KEY];
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const [resp, token] = await rawGqlFetch<R>(print(doc), vars || {}, headers);

  if (isBrowser && token) {
    document.cookie = serialize(AUTH_TOKEN_KEY, token, {
      expires: daysFromNow(3),
      sameSite: "strict",
      path: "/",
    });
  }

  const gqlResponse = await getGqlResponse<R>(resp);
  if (gqlResponse.kind === "error") {
    throw gqlResponse.errors;
  }

  return gqlResponse.data;
}

export const sdk = getSdk(requester);

interface Response<T> {
  data?: T;
  errors?: {
    message: string;
  }[];
}

type Result<T> =
  | {
      kind: "success";
      data: T;
    }
  | {
      kind: "error";
      errors: {
        message: string;
      }[];
    };

export async function rawGqlFetch<R>(
  query: string,
  variables: Record<string, any>,
  headers: HeadersInit
): Promise<[Response<R>, string | null]> {
  const resp = await fetch(`${import.meta.env.VITE_VENDURE_URL}/shop-api`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const newToken = resp.headers.get(AUTH_TOKEN_KEY);

  return [(await resp.json()) as Response<R>, newToken];
}

export function headersWithAuth(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function graphqlRequestHandler(
  event: RequestEventCommon<QwikCityPlatform>
) {
  const cookie = event.cookie.get(AUTH_TOKEN_KEY);
  const headers = headersWithAuth(cookie?.value || "");

  return async function <T>(query: string, variables: Record<string, any>) {
    const [resp, newToken] = await rawGqlFetch<T>(query, variables, headers);

    if (newToken) {
      event.cookie.set(AUTH_TOKEN_KEY, newToken);
    }

    const gqlResp = await getGqlResponse<T>(resp);
    if (gqlResp.kind === "error") {
      throw gqlResp.errors;
    }

    return gqlResp.data;
  };
}

export const serverGqlFetch: typeof rawGqlFetch = server$(async function (
  query: string,
  variables: Record<string, any>
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = this.cookie.get(AUTH_TOKEN_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(`${import.meta.env.VITE_VENDURE_URL}/shop-api`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const newToken = resp.headers.get(AUTH_TOKEN_KEY);
  if (newToken) {
    this.cookie.set(AUTH_TOKEN_KEY, newToken);
  }

  return resp.json();
});

export async function getGqlResponse<T>(resp: Response<T>): Promise<Result<T>> {
  if (resp.errors) {
    return { kind: "error", errors: resp.errors };
  }

  if (!resp.data) {
    throw new Error("Unexpected result");
  }

  return { kind: "success", data: resp.data };
}

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<Result<T>> {
  const [resp] = await rawGqlFetch<T>(query, variables, {});

  return getGqlResponse<T>(resp);
}

export function useQuery<T>(query: string) {
  const exec$ = $(async (variables: Record<string, any> = {}) => {
    const result = await graphqlRequest<T>(query, variables);
    if (result.kind === "error") {
      throw result.errors;
    }

    return result;
  });

  return exec$;
}

export interface MutationStore<T> {
  data?: T;
  loading: boolean;
  errors?: { message: string }[];
}

export function useMutation<T extends (...args: any) => Promise<any>>(
  fun$: QRL<T>
) {
  const result = useStore<MutationStore<Awaited<ReturnType<T>>>>({
    loading: false,
  });

  const exec$ = $(async (...params: Parameters<T>) => {
    result.loading = true;
    result.data = await fun$(...params);
    result.loading = false;
  });

  return { exec$, result };
}
