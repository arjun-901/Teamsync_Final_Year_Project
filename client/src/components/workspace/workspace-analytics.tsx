import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Layers3,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const analytics = data?.analytics;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          isLoading={isPending}
          title="All Tasks"
          value={analytics?.totalTasks || 0}
          subtitle="Aapke visible projects ke combined tasks"
          icon={Layers3}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Active Projects"
          value={analytics?.totalProjects || 0}
          subtitle="Jin projects me aap kaam kar rahe ho"
          icon={FolderKanban}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Assigned To Me"
          value={analytics?.assignedToMeTasks || 0}
          subtitle="Open tasks directly assigned to you"
          icon={Target}
          tone="warning"
        />
        <AnalyticsCard
          isLoading={isPending}
          title="In Progress"
          value={analytics?.inProgressTasks || 0}
          subtitle="Currently moving tasks"
          icon={Clock3}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Due Soon"
          value={analytics?.dueSoonTasks || 0}
          subtitle="Next 7 days me due hone wale"
          icon={AlertTriangle}
          tone="warning"
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Completed"
          value={analytics?.completedTasks || 0}
          subtitle={`${analytics?.completionRate || 0}% overall completion`}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Execution Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-semibold">
                  {analytics?.completionRate || 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${analytics?.completionRate || 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                <p className="text-muted-foreground">To Do</p>
                <p className="mt-1 text-xl font-semibold">
                  {analytics?.todoTasks || 0}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-muted-foreground">In Progress</p>
                <p className="mt-1 text-xl font-semibold">
                  {analytics?.inProgressTasks || 0}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-muted-foreground">High Priority</p>
                <p className="mt-1 text-xl font-semibold">
                  {analytics?.highPriorityTasks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_55%,#ecfeff_100%)]">
          <CardHeader>
            <CardTitle className="text-base">Smart Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p>
              Aapke visible projects me <strong>{analytics?.totalTasks || 0}</strong>{" "}
              tasks hain, jinme se <strong>{analytics?.completedTasks || 0}</strong>{" "}
              complete ho chuke hain.
            </p>
            <p>
              Abhi <strong>{analytics?.assignedToMeTasks || 0}</strong> tasks
              directly aapko assigned hain aur{" "}
              <strong>{analytics?.dueSoonTasks || 0}</strong> tasks next 7 days
              me due hain.
            </p>
            <p>
              Agar <strong>{analytics?.overdueTasks || 0}</strong> overdue aur{" "}
              <strong>{analytics?.highPriorityTasks || 0}</strong> high-priority
              tasks pe focus karoge to dashboard health sabse fast improve hogi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;
