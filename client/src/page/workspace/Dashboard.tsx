import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";

const WorkspaceDashboard = () => {
  return (
    <main className="flex flex-1 flex-col py-2 md:pt-2">
      <WorkspaceAnalytics />

      <div className="mt-3">
        <Tabs
          defaultValue="projects"
          className="w-full rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-1.5"
        >
          <TabsList className="h-9 w-full justify-start rounded-lg border-0 bg-white/80 px-1 shadow-sm">
            <TabsTrigger className="rounded-md py-1 text-xs sm:text-sm" value="projects">
              Recent Projects
            </TabsTrigger>
            <TabsTrigger className="rounded-md py-1 text-xs sm:text-sm" value="tasks">
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger className="rounded-md py-1 text-xs sm:text-sm" value="members">
              Recent Members
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-2" value="projects">
            <RecentProjects />
          </TabsContent>
          <TabsContent className="mt-2" value="tasks">
            <RecentTasks />
          </TabsContent>
          <TabsContent className="mt-2" value="members">
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default WorkspaceDashboard;
