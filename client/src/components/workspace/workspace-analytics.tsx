import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
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
          icon={Layers3}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Active Projects"
          value={analytics?.totalProjects || 0}
          icon={FolderKanban}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Assigned To Me"
          value={analytics?.assignedToMeTasks || 0}
          icon={Target}
          tone="warning"
        />
        <AnalyticsCard
          isLoading={isPending}
          title="In Progress"
          value={analytics?.inProgressTasks || 0}
          icon={Clock3}
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Due Soon"
          value={analytics?.dueSoonTasks || 0}
          icon={AlertTriangle}
          tone="warning"
        />
        <AnalyticsCard
          isLoading={isPending}
          title="Completed"
          value={analytics?.completedTasks || 0}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Execution Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Completion Rate</span>
                <span className="font-semibold text-slate-900">
                  {analytics?.completionRate || 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${analytics?.completionRate || 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">To Do</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics?.todoTasks || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">In Progress</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics?.inProgressTasks || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-500">High Priority</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics?.highPriorityTasks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Priority Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertTriangle className="size-4 text-amber-500" />
                Overdue
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {analytics?.overdueTasks || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ListTodo className="size-4 text-slate-500" />
                Assigned
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {analytics?.assignedToMeTasks || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="size-4 text-blue-500" />
                Due Soon
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {analytics?.dueSoonTasks || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Target className="size-4 text-rose-500" />
                High Priority
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {analytics?.highPriorityTasks || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;
