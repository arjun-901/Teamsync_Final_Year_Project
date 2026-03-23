import { AlertTriangle, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import { Card, CardContent } from "@/components/ui/card";
const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Workspace Overview
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview for this workspace!
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus />
          New Project
        </Button>
      </div>
      <WorkspaceAnalytics />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_50%,#0f766e_100%)] text-white shadow-xl">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-100/80">
                <Sparkles className="size-4" />
                Smart Dashboard
              </p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight">
                Ab aapke saare joined projects ka combined task snapshot ek hi
                jagah milta hai.
              </h3>
              <p className="mt-3 max-w-2xl text-sm text-slate-100/85">
                Dashboard ab sirf counts nahi dikhata, balki assigned work,
                due-soon pressure aur completion health bhi highlight karta hai.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle className="size-4 text-amber-500" />
              Focus Tip
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pehle overdue aur due-soon tasks clear karo, phir high-priority
              work ko in-progress me shift karo. Isse team delivery velocity aur
              dashboard health dono better dikhenge.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="projects" className="w-full border rounded-lg p-2">
          <TabsList className="w-full justify-start border-0 bg-gray-50 px-1 h-12">
            <TabsTrigger className="py-2" value="projects">
              Recent Projects
            </TabsTrigger>
            <TabsTrigger className="py-2" value="tasks">
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger className="py-2" value="members">
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
