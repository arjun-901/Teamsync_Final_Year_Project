import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, subDays } from "date-fns";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Layers3,
  Plus,
  Settings2,
  Target,
  TrendingUp,
  Users2,
  Video,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Permissions } from "@/constant";
import { getAllTasksQueryFn, getWorkspaceAnalyticsQueryFn, getWorkspaceMeetingsQueryFn } from "@/lib/api";
import AnalyticsCard from "./common/analytics-card";
import { useNavigate } from "react-router-dom";
import { TaskType } from "@/types/api.type";

const chartPalette = {
  primary: "#4f46e5",
  success: "#16a34a",
  warning: "#eab308",
};

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();
  const { workspace, hasPermission } = useAuthContext();
  const { onOpen } = useCreateProjectDialog();
  const [range, setRange] = useState("last_7_days");
  const [granularity, setGranularity] = useState("daily");

  const canCreateProject = hasPermission(Permissions.CREATE_PROJECT);
  const canManageWorkspace = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS);

  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const { data: meetingsData, isPending: isMeetingsPending } = useQuery({
    queryKey: ["meetings", workspaceId],
    queryFn: () => getWorkspaceMeetingsQueryFn(workspaceId),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const { data: tasksData } = useQuery({
    queryKey: ["dashboard-tasks", workspaceId, range, granularity],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        pageNumber: 1,
        pageSize: 100,
      }),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const { data: membersData, isPending: isMembersPending } = useGetWorkspaceMembers(workspaceId);

  const analytics = data?.analytics;
  const meetings = meetingsData?.meetings || [];
  const tasks: TaskType[] = tasksData?.tasks || [];
  const members = membersData?.members || [];

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter((meeting: any) => meeting.status === "scheduled" || meeting.status === "live")
      .sort(
        (a: any, b: any) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      .slice(0, 4);
  }, [meetings]);

  const tasksTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = subDays(new Date(), 6 - index);
      const label = format(date, "dd MMM");

      const count = tasks.filter((task) => {
        const target = task.updatedAt || task.createdAt || task.dueDate;
        return target ? isSameDay(new Date(target), date) : false;
      }).length;

      return {
        label,
        tasks: count,
      };
    });

    return days;
  }, [tasks]);

  const taskStatusData = useMemo(
    () => [
      {
        name: "To Do",
        value: analytics?.todoTasks || 0,
        fill: chartPalette.warning,
      },
      {
        name: "In Progress",
        value: analytics?.inProgressTasks || 0,
        fill: chartPalette.primary,
      },
      {
        name: "Completed",
        value: analytics?.completedTasks || 0,
        fill: chartPalette.success,
      },
    ],
    [analytics?.completedTasks, analytics?.inProgressTasks, analytics?.todoTasks]
  );

  const completionSummary = useMemo(() => {
    const totalTasks = analytics?.totalTasks || 0;
    const completedTasks = analytics?.completedTasks || 0;
    return totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks closed` : "No tasks yet";
  }, [analytics?.completedTasks, analytics?.totalTasks]);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[22px] border-2 border-indigo-300 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-3.5 lg:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-indigo-700 shadow-sm">
                <Activity className="h-3 w-3 text-indigo-500" />
                Modern workspace dashboard
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                  Workspace Overview
                </h2>
                <p className="max-w-2xl text-xs text-slate-500 sm:text-sm">
                  Track tasks, projects, meetings, and team momentum from one responsive
                  dashboard for {workspace?.name || "your workspace"}.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-9 min-w-[128px] rounded-xl border-indigo-200 bg-white text-xs text-slate-700 shadow-sm sm:text-sm">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="h-9 min-w-[118px] rounded-xl border-indigo-200 bg-white text-xs text-slate-700 shadow-sm sm:text-sm">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>

              {canCreateProject ? (
                <Button
                  onClick={onOpen}
                  className="h-9 rounded-xl bg-white px-3 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-50 hover:shadow-lg"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Button>
              ) : null}

              {canManageWorkspace ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
                  className="h-9 rounded-xl border-indigo-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="self-start rounded-2xl border border-indigo-300 bg-white p-3.5 shadow-sm">
              <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Execution health</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {analytics?.completionRate || 0}% completion rate
                  </p>
                </div>
                <Badge className="w-fit rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[11px] text-indigo-700 hover:bg-white">
                  {completionSummary}
                </Badge>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 transition-all"
                  style={{ width: `${analytics?.completionRate || 0}%` }}
                />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    To Do
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-slate-950">
                    {analytics?.todoTasks || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    In Progress
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-slate-950">
                    {analytics?.inProgressTasks || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    High Priority
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-slate-950">
                    {analytics?.highPriorityTasks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-cyan-300 bg-white p-3 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Team activity
                </p>
                <p className="mt-1.5 text-lg font-semibold text-slate-950">
                  {isMembersPending ? "..." : members.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Workspace members</p>
              </div>

              <div className="rounded-xl border border-emerald-300 bg-white p-3 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Live calls
                </p>
                <p className="mt-1.5 text-lg font-semibold text-slate-950">
                  {meetings.filter((meeting: any) => meeting.status === "live").length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Meetings happening now</p>
              </div>

              <div className="rounded-xl border border-amber-300 bg-white p-3 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Due soon
                </p>
                <p className="mt-1.5 text-lg font-semibold text-slate-950">
                  {analytics?.dueSoonTasks || 0}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Tasks requiring attention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-blue-300 bg-white p-3">
          <div className="flex items-center gap-1.5">
            <Layers3 className="h-3.5 w-3.5 text-blue-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Task Overview
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AnalyticsCard
              isLoading={isPending}
              title="All Tasks"
              value={analytics?.totalTasks || 0}
              icon={Layers3}
            />
            <AnalyticsCard
              isLoading={isPending}
              title="Assigned To Me"
              value={analytics?.assignedToMeTasks || 0}
              icon={Target}
              tone="warning"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-violet-300 bg-white p-3">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-violet-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Project Stats
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AnalyticsCard
              isLoading={isPending}
              title="Active Projects"
              value={analytics?.totalProjects || 0}
              icon={FolderKanban}
            />
            <AnalyticsCard
              isLoading={isPending}
              title="Completed"
              value={analytics?.completedTasks || 0}
              icon={CheckCircle2}
              tone="success"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-emerald-300 bg-white p-3">
          <div className="flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5 text-emerald-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Team Activity
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AnalyticsCard
              isLoading={isPending}
              title="In Progress"
              value={analytics?.inProgressTasks || 0}
              icon={Clock3}
            />
            <AnalyticsCard
              isLoading={isPending}
              title="Overdue"
              value={analytics?.overdueTasks || 0}
              icon={AlertTriangle}
              tone="danger"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="rounded-[20px] border-2 border-blue-300 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="space-y-1 p-4 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-950">
                  Task momentum
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Recent task activity based on current workspace task history.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Daily
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tasksTrend} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke={chartPalette.primary}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-2 border-amber-300 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="space-y-1 p-4 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-950">
              Status distribution
            </CardTitle>
            <p className="text-xs text-slate-500">
              Snapshot of current task states across the workspace.
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.06)" }}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={chartPalette.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[20px] border-2 border-violet-300 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-950">
                  Priority snapshot
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Fast overview of the tasks that need attention first.
                </p>
              </div>
              <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-300 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Overdue
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {analytics?.overdueTasks || 0}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-300 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs text-indigo-700">
                <Target className="h-3.5 w-3.5" />
                Assigned
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {analytics?.assignedToMeTasks || 0}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {analytics?.completedTasks || 0}
              </p>
            </div>
            <div className="rounded-xl border border-rose-300 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs text-rose-700">
                <Clock3 className="h-3.5 w-3.5" />
                Due Soon
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {analytics?.dueSoonTasks || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-2 border-emerald-300 bg-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-950">
                  Upcoming video calls
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Scheduled and live meetings at a glance.
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] text-emerald-700">
                {upcomingMeetings.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-0">
            {isMeetingsPending ? (
              <p className="text-xs text-slate-500">Loading calls...</p>
            ) : upcomingMeetings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-white px-3 py-4 text-xs text-slate-500">
                No scheduled video calls right now.
              </div>
            ) : (
              upcomingMeetings.map((meeting: any) => (
                <button
                  key={meeting._id}
                  type="button"
                  onClick={() =>
                    navigate(`/workspace/${workspaceId}/meetings/${meeting._id}`)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 text-blue-600" />
                      <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                        {meeting.title}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {format(new Date(meeting.scheduledAt), "dd MMM, hh:mm a")}
                      </span>
                      <span>{meeting.duration} min</span>
                    </div>
                  </div>
                  <Badge
                    variant={meeting.status === "live" ? "destructive" : "outline"}
                    className="ml-3 capitalize"
                  >
                    {meeting.status}
                  </Badge>
                </button>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-xl border-emerald-300 bg-white text-xs text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg sm:text-sm"
              onClick={() => navigate(`/workspace/${workspaceId}/meetings`)}
            >
              View all meetings
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default WorkspaceAnalytics;
