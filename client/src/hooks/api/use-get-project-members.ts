import { getProjectMembersQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useGetProjectMembers = ({
  workspaceId,
  projectId,
  skip = false,
}: {
  workspaceId: string;
  projectId?: string;
  skip?: boolean;
}) => {
  const query = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: () =>
      getProjectMembersQueryFn({
        workspaceId,
        projectId: projectId as string,
      }),
    enabled: Boolean(workspaceId && projectId) && !skip,
  });

  return query;
};

export default useGetProjectMembers;
