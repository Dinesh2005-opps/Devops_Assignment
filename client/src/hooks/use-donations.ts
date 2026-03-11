import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth } from "../lib/api-client";
import { z } from "zod";

type DonationInput = z.infer<typeof api.donations.create.input>;

export function useCreateDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (donationData: DonationInput) => {
      const validated = api.donations.create.input.parse(donationData);
      const data = await fetchWithAuth(api.donations.create.path, {
        method: api.donations.create.method,
        body: JSON.stringify(validated),
      });
      return data;
    },
    onSuccess: () => {
      // Refresh needs list in case donation affected a need's status internally
      queryClient.invalidateQueries({ queryKey: [api.needs.list.path] });
    },
  });
}
