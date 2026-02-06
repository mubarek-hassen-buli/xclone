import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { Alert } from "react-native";

export const useFollow = (targetUserId: string, username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => userApi.followUser(api, targetUserId),
    onSuccess: (data) => {
      // Invalidate queries to refresh follower counts and follow status
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.error || "Failed to follow user");
    },
  });

  return {
    followUser: followMutation.mutate,
    isFollowingLoading: followMutation.isPending,
  };
};
