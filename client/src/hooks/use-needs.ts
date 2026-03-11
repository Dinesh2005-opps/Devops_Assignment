import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "../lib/api-client";
import { z } from "zod";

type NeedInput = z.infer<typeof api.needs.create.input>;

export function useNeeds(filters?: { search?: string; location?: string }) {
  return useQuery({
    queryKey: [api.needs.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.location) params.append("location", filters.location);
      
      const url = `${api.needs.list.path}${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await fetchWithAuth(url);
      
      // Since response is z.array(z.custom<any>()) in schema, we'll bypass strict Zod validation here
      // and trust the backend shape, but typically we'd parse it.
      return data;
    },
  });
}

export function useCreateNeed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (needData: NeedInput) => {
      const validated = api.needs.create.input.parse(needData);
      const data = await fetchWithAuth(api.needs.create.path, {
        method: api.needs.create.method,
        body: JSON.stringify(validated),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.needs.list.path] });
    },
  });
}

export function useUpdateNeedStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.needs.updateStatus.path, { id });
      const data = await fetchWithAuth(url, {
        method: api.needs.updateStatus.method,
        body: JSON.stringify({ status }),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.needs.list.path] });
    },
  });
}
