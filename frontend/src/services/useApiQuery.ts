import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import api from "./Provider";

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface QueryPayload<T = any> {
  endpoint: string;
  params?: T;
  queryKey?: any[];
}

export function useApiQuery<TParams = any, TRes = any>(
  { endpoint, params, queryKey }: QueryPayload<TParams>,
  options?: UseQueryOptions<TRes, Error>
) {
  return useQuery<TRes, Error>({
    queryKey: queryKey ?? [endpoint, params],
    queryFn: async () => {
      const res = await api.get<Response<TRes>>(endpoint, {
        params,
      });
      return res.data.data;
    },
    ...options,
  });
}
