import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth, setToken, clearToken } from "../lib/api-client";
import { z } from "zod";
import { useLocation } from "wouter";

type User = z.infer<typeof api.auth.me.responses[200]>;
type LoginInput = z.infer<typeof api.auth.login.input>;
type RegisterInput = z.infer<typeof api.auth.register.input>;

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      try {
        const data = await fetchWithAuth(api.auth.me.path);
        return api.auth.me.responses[200].parse(data);
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity, // Don't refetch constantly
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const validated = api.auth.login.input.parse(credentials);
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Login failed");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation(data.user.role === "orphanage" ? "/orphanage" : "/donor");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterInput) => {
      const validated = api.auth.register.input.parse(userData);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }
      
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation(data.user.role === "orphanage" ? "/orphanage" : "/donor");
    },
  });

  const logout = () => {
    clearToken();
    queryClient.setQueryData([api.auth.me.path], null);
    queryClient.clear();
    setLocation("/");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
