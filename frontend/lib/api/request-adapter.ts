import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  FetchAdapterOpts,
  HttpClient,
  MethodsEnum,
  MethodType,
  RequesterFn,
} from "./types";

export function AxiosAdapter(
  instance: AxiosInstance,
  opts?: AxiosRequestConfig
): RequesterFn {
  return async function requester<T>(
    url: string,
    method: MethodType,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      url,
      method,
      data: body,
      headers,
      ...opts,
    };
    const response: AxiosResponse<T> = await instance.request(config);
    return response?.data;
  };
}

export function FetchAdapter(opts?: FetchAdapterOpts): RequesterFn {
  return async function requester<T>(
    url: string,
    method: MethodType,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const { baseURL, ...rest } = opts || {};
    let _url = "";

    if (baseURL) {
      _url = `${baseURL}${url}`;
    } else {
      _url = url;
    }

    const response = await fetch(_url, {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response.json() as Promise<T>;
  };
}

/**
 * utility function that create a wrapper around a http client,
 * easily network requests
 *
 *
 * @param requester - it's a adapter that normalize params and return of data between unlike http clients
 * @returns returns the main request methods such as (GET, POST, DELETE ...)
 */
export function CreateHttpClientAdapter(requester: RequesterFn): HttpClient {
  return {
    requester,
    async GET<T>(url: string, headers?: Record<string, string>): Promise<T> {
      return this.requester<T>(url, MethodsEnum.GET, undefined, headers);
    },
    async POST<T, B = unknown>(
      url: string,
      body?: B,
      headers?: Record<string, string>
    ): Promise<T> {
      return this.requester<T>(url, MethodsEnum.POST, body, headers);
    },
    async PUT<T, B = unknown>(
      url: string,
      body?: B,
      headers?: Record<string, string>
    ): Promise<T> {
      return this.requester<T>(url, MethodsEnum.PUT, body, headers);
    },
    async DELETE<T>(url: string, headers?: Record<string, string>): Promise<T> {
      return this.requester<T>(url, MethodsEnum.DELETE, undefined, headers);
    },
    async PATCH<T, B = unknown>(
      url: string,
      body?: B,
      headers?: Record<string, string>
    ): Promise<T> {
      return this.requester<T>(url, MethodsEnum.PATCH, body, headers);
    },
  };
}
