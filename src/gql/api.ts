import { $, useEnvData, useStore } from "@builder.io/qwik";
import { isBrowser, isServer } from "@builder.io/qwik/build";
import { GraphQLClient, rawRequest } from "graphql-request";
import { parse, serialize } from "cookie";

export const AUTH_TOKEN_KEY = "vendure-auth-token";

export function getHeaders() {
  const headers: HeadersInit = {};

  if (isServer) {
    const requestHeaders =
      useEnvData<Record<string, string>>("requestHeaders") || {};
    const cookies = requestHeaders["cookie"] || "";
    const token = parse(cookies)[AUTH_TOKEN_KEY];

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export const client = new GraphQLClient(
  `${import.meta.env.VITE_VENDURE_URL}/shop-api`,
  { errorPolicy: "all" }
);

type AsyncResponse<T> = ReturnType<typeof rawRequest<T>>;
type Response<T> = Awaited<AsyncResponse<T>>;

export function makeCache() {
  let lookup: Record<string, Response<any>> = {};

  function clear() {
    lookup = {};
  }

  function add<T>(
    doc: string,
    vars: Record<string, any> = {},
    resp: Response<T>
  ) {
    const key = doc + JSON.stringify(vars);
    lookup[key] = resp;
  }

  function get(doc: string, vars: Record<string, any> = {}) {
    const key = doc + JSON.stringify(vars);
    return lookup[key];
  }

  return { get, add, clear };
}

export const cache = makeCache();

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function request<T>(
  doc: string,
  vars: Record<string, any> = {},
  headersInit: Record<string, string> = {}
): AsyncResponse<T> {
  const cachedResp = cache.get(doc, vars);
  if (cachedResp) {
    return cachedResp;
  }

  if (isBrowser) {
    const token = parse(document.cookie)[AUTH_TOKEN_KEY];
    if (token) {
      headersInit.Authorization = `Bearer ${token}`;
    }
  }

  const resp = await client.rawRequest<T>(doc, vars, headersInit);
  const token = resp.headers.get(AUTH_TOKEN_KEY);
  if (isBrowser && token) {
    document.cookie = serialize(AUTH_TOKEN_KEY, token, {
      expires: daysFromNow(3),
      sameSite: "strict",
      path: "/",
    });
  }

  cache.add(doc, vars, resp);
  return resp;
}

export function useQuery<T>(query: string) {
  const headers = getHeaders();
  const exec$ = $(async (variables: Record<string, any> = {}) => {
    const { data } = await request<T>(query, variables, headers);
    return data;
  });

  return exec$;
}

interface MutationStore<T> {
  data?: T;
  loading: boolean;
  errors?: { message: string }[];
}

export function useMutation<T>(mutation: string) {
  const headers = getHeaders();

  const result = useStore<MutationStore<T>>({
    loading: false,
  });

  const exec$ = $(async (variables: Record<string, any> = {}) => {
    try {
      cache.clear();
      result.loading = true;
      const { data, errors } = await request<T>(mutation, variables, headers);
      result.errors = errors?.map((err) => ({ ...err }));
      result.data = data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "error";
      result.errors = [{ message: message }];
    }
    result.loading = false;
  });

  return { exec$, result };
}
