import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) => console.log("✅ User synced:", response.data.message),
    onError: (error: any) => {
      console.error("❌ User sync failed:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      
      // Show user-friendly message
      if (error.response?.status === 500) {
        console.error("Server error - this might be a configuration issue on the backend");
      }
    },
  });

  // auto-sync user when signed in
  useEffect(() => {
    // if user is signed in and user is not synced yet, sync user
    if (isSignedIn && !syncUserMutation.data) {
      syncUserMutation.mutate();
    }
  }, [isSignedIn]);

  return null;
};
