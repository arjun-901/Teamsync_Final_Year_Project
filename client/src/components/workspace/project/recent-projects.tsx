import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { Loader } from "lucide-react";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";

const RecentProjects = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 10,
  });

  const projects = data?.projects || [];

  return (
    <div className="flex flex-col pt-1">
      {isPending ? (
        <Loader
          className="w-8 h-8
         animate-spin
         place-self-center
         flex"
        />
      ) : null}
      {projects?.length === 0 && (
        <div
          className="font-semibold
         text-sm text-muted-foreground
          text-center py-4"
        >
          No Project created yet
        </div>
      )}

      <ul role="list" className="space-y-1.5">
        {projects.map((project) => {
          const name = project.createdBy.name;
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);

          return (
            <li
              key={project._id}
              role="listitem"
              className="cursor-pointer rounded-lg border border-transparent px-2 py-2 hover:border-slate-200 hover:bg-gray-50 transition-colors ease-in-out"
            >
              <Link
                to={`/workspace/${workspaceId}/project/${project._id}`}
                className="grid gap-4 p-0"
              >
                <div className="flex items-start gap-2">
                  <div className="text-lg !leading-[1.2rem]">
                    {project.emoji}
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-medium leading-none sm:text-sm">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.createdAt
                        ? format(project.createdAt, "PPP")
                        : null}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="hidden text-xs text-gray-500 sm:inline">Created by</span>
                    <Avatar className="hidden h-8 w-8 sm:flex">
                      <AvatarImage
                        src={project.createdBy.profilePicture || ""}
                        alt="Avatar"
                      />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentProjects;
