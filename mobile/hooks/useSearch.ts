import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "@/utils/api";
import { useState, useEffect } from "react";

export const useSearch = () => {
  const api = useApiClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => userApi.searchUsers(api, debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    select: (response) => response.data.users,
  });

  return {
    users: data || [],
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
  };
};
