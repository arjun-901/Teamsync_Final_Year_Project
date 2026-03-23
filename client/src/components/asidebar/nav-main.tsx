"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  Video,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { useParams } from "react-router-dom";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export function NavMain() {
  const { hasPermission } = useAuthContext();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const { projectId } = useParams();
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 1,
    pageNumber: 1,
    skip: !workspaceId,
  });

  const pathname = location.pathname;
  const search = location.search;
  const fallbackProjectId = projectsData?.projects?.[0]?._id;
  const activeProjectId = projectId || fallbackProjectId;
  const projectChatUrl = activeProjectId
    ? `/workspace/${workspaceId}/project/${activeProjectId}/chat`
    : "";
  const sharedFilesUrl = activeProjectId
    ? `/workspace/${workspaceId}/project/${activeProjectId}/chat?tab=files`
    : "";

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Members",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    {
      title: "Meetings",
      url: `/workspace/${workspaceId}/meetings`,
      icon: Video,
    },
    ...(activeProjectId
      ? [
          {
            title: "Project Chat",
            url: projectChatUrl,
            icon: MessageSquare,
            isActive:
              pathname === `/workspace/${workspaceId}/project/${activeProjectId}/chat`
              && search !== "?tab=files",
          },
          {
            title: "Shared Files",
            url: sharedFilesUrl,
            icon: FolderOpen,
            isActive:
              pathname === `/workspace/${workspaceId}/project/${activeProjectId}/chat`
              && search === "?tab=files",
          },
        ]
      : []),
    ...(canManageSettings
      ? [
          {
            title: "Settings",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={item.isActive ?? item.url === pathname}
              asChild
            >
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
