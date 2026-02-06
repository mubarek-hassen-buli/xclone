import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { User } from "../types";

export const useUserProfile = (username?: string) => {
  const api = useApiClient();

  const {
    data: profileUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => {
      if (!username) return userApi.getCurrentUser(api).then(res => res.data.user);
      return userApi.getUserProfile(api, username).then(res => res.data.user);
    },
    enabled: true,
  });

  return { profileUser: profileUser as User | undefined, isLoading, error, refetch };
};
