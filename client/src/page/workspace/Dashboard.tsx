import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";

const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Workspace Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Track projects, tasks, and team activity.
          </p>
        </div>
        <Button onClick={onOpen} className="shrink-0">
          <Plus />
          New Project
        </Button>
      </div>

      <WorkspaceAnalytics />

      <div className="mt-4">
        <Tabs
          defaultValue="projects"
          className="w-full rounded-2xl border border-slate-200 bg-white p-2"
        >
          <TabsList className="h-11 w-full justify-start rounded-xl border-0 bg-slate-100 px-1">
            <TabsTrigger className="rounded-lg py-2" value="projects">
              Recent Projects
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2" value="tasks">
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2" value="members">
              Recent Members
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <RecentProjects />
          </TabsContent>
          <TabsContent value="tasks">
            <RecentTasks />
          </TabsContent>
          <TabsContent value="members">
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default WorkspaceDashboard;
