import { Loader } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { getProjectMembersQueryFn } from "@/lib/api";

const ProjectMembersOverview = () => {
  const workspaceId = useWorkspaceId();

  const { data: projectsData, isPending: projectsLoading } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageNumber: 1,
      pageSize: 100,
      skip: !workspaceId,
    });

  const projects = projectsData?.projects || [];

  const projectMemberQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["project-members-overview", workspaceId, project._id],
      queryFn: () =>
        getProjectMembersQueryFn({
          workspaceId,
          projectId: project._id,
        }),
      enabled: Boolean(workspaceId && project._id),
      staleTime: Infinity,
    })),
  });

  const projectMemberMap = projects.map((project, index) => {
    const query = projectMemberQueries[index];
    const projectMembers =
      query?.data?.members?.filter((member) => member.isProjectMember) || [];

    return {
      project,
      projectMembers,
      isLoading: query?.isPending,
    };
  });

  const isMembersLoading =
    projects.length > 0 &&
    projectMemberQueries.some((query) => query.isPending && !query.data);

  return (
    <div className="pt-1">
      <h5 className="text-lg leading-[30px] font-semibold mb-1">
        Project member visibility
      </h5>
      <p className="text-sm text-muted-foreground leading-tight">
        View which members are assigned to each project.
      </p>

      {projectsLoading || isMembersLoading ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex mt-4" />
      ) : null}

      {!projectsLoading && projects.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          No projects have been created yet. Once a project is created, member
          mapping will appear here.
        </p>
      ) : null}

      <div className="grid gap-3 mt-4">
        {projectMemberMap.map(({ project, projectMembers, isLoading }) => (
          <div
            key={project._id}
            className="rounded-lg border px-3 py-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{project.emoji}</span>
              <p className="font-medium leading-none">{project.name}</p>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading members...</p>
            ) : null}

            {!isLoading && projectMembers.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {projectMembers.map((member) => member.userId.name).join(", ")}
              </p>
            ) : null}

            {!isLoading && projectMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members are currently assigned to this project.
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMembersOverview;
