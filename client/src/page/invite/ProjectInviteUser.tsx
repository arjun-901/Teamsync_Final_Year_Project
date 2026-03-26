import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import useAuth from "@/hooks/api/use-auth";
import {
  getProjectInviteDetailsQueryFn,
  joinProjectInviteMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ProjectInviteUser = () => {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const { data: authData, isPending: authLoading } = useAuth();
  const user = authData?.user;

  const { data: inviteData, isPending: inviteLoading } = useQuery({
    queryKey: ["project-invite", token],
    queryFn: () => getProjectInviteDetailsQueryFn(token),
    enabled: !!token,
  });

  const { mutate, isPending: isJoining } = useMutation({
    mutationFn: joinProjectInviteMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.PROJECT_INVITE_URL.replace(":token", token)}`
  );

  useEffect(() => {
    if (!user || !token) return;

    mutate(token, {
      onSuccess: (data) => {
        navigate(`/workspace/${data.workspaceId}/project/${data.projectId}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }, [mutate, navigate, token, user]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Logo url={BASE_ROUTE.HOME} />
          <Link to={BASE_ROUTE.HOME}>Team Sync.</Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {inviteData?.invite?.project?.emoji} Join{" "}
              {inviteData?.invite?.project?.name || "Project"}
            </CardTitle>
            <CardDescription>
              {inviteData?.invite?.workspace?.name
                ? `Workspace: ${inviteData.invite.workspace.name}`
                : "Project invite link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authLoading || inviteLoading || isJoining ? (
              <Loader className="!w-10 !h-10 animate-spin place-self-center flex" />
            ) : user ? (
              <p className="text-center text-sm text-muted-foreground">
                Aapko direct project me join karaya ja raha hai...
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to={`/sign-up?returnUrl=${returnUrl}`}>
                  <Button className="w-full">Signup and Join</Button>
                </Link>
                <Link to={`/sign-in?returnUrl=${returnUrl}`}>
                  <Button variant="secondary" className="w-full border">
                    Login and Join
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectInviteUser;
