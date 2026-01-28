import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import api from "./Provider";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface MutationPayload<TReq> {
  endpoint: string;
  method?: HttpMethod;
  body?: TReq;
}

export function useApiMutation<TReq = any, TRes = any>(
  options?: UseMutationOptions<ApiResponse<TRes>, Error, MutationPayload<TReq>>
) {
  return useMutation<ApiResponse<TRes>, Error, MutationPayload<TReq>>({
    mutationFn: async ({ endpoint, method = "POST", body }) => {
      try {
        const response = await api.request<ApiResponse<TRes>>({
          url: endpoint,
          method,
          data: body,
        });
        return response.data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
    },
    ...options,
  });
}
