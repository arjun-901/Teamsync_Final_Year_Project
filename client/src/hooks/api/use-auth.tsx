import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
  return query;
};

export default useAuth;
