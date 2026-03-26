import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/auth-provider";
import { useToast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import {
  deleteProjectChatMessageMutationFn,
  getProjectByIdQueryFn,
  getProjectChatMessagesQueryFn,
  sendProjectChatMessageMutationFn,
} from "@/lib/api";
import {
  ProjectChatAttachmentType,
  ProjectChatMessageType,
} from "@/types/api.type";

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getAttachmentIcon = (attachment: ProjectChatAttachmentType) => {
  if (attachment.fileType === "image") return FileImage;
  if (attachment.fileType === "video") return FileVideo;
  if (attachment.fileType === "audio") return FileAudio;
  if (attachment.fileType === "document") return FileText;
  return File;
};

const ProjectChatPanel = () => {
  const { projectId = "" } = useParams();
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentTab = searchParams.get("tab") === "files" ? "files" : "chat";

  const { data: projectData } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () =>
      getProjectByIdQueryFn({
        workspaceId,
        projectId,
      }),
    enabled: Boolean(projectId),
    staleTime: Infinity,
  });

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["project-chat", workspaceId, projectId, currentTab],
    queryFn: () =>
      getProjectChatMessagesQueryFn({
        workspaceId,
        projectId,
        attachmentsOnly: currentTab === "files",
      }),
    enabled: Boolean(workspaceId && projectId),
    refetchInterval: 5000,
  });

  const messages = data?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, currentTab]);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: sendProjectChatMessageMutationFn,
    onSuccess: (response) => {
      setMessage("");
      setFiles([]);
      queryClient.invalidateQueries({
        queryKey: ["project-chat", workspaceId, projectId],
      });
      toast({
        title: "Success",
        description: response.message,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteMessage, isPending: isDeleting } = useMutation({
    mutationFn: deleteProjectChatMessageMutationFn,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["project-chat", workspaceId, projectId],
      });
      toast({
        title: "Success",
        description: response.message,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sharedFiles = useMemo(
    () =>
      messages.flatMap((chatMessage) =>
        chatMessage.attachments.map((attachment) => ({
          attachment,
          chatMessage,
        }))
      ),
    [messages]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    event.target.value = "";
  };

  const handleSend = () => {
    if (!message.trim() && files.length === 0) {
      toast({
        title: "Message required",
        description: "Please enter a message or attach at least one file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("message", message);
    files.forEach((file) => {
      formData.append("files", file);
    });

    sendMessage({
      workspaceId,
      projectId,
      data: formData,
    });
  };

  const renderAttachment = (
    attachment: ProjectChatAttachmentType,
    compact = false
  ) => {
    const AttachmentIcon = getAttachmentIcon(attachment);

    if (attachment.fileType === "image") {
      return (
        <a href={attachment.url} target="_blank" rel="noreferrer" className="block">
          <img
            src={attachment.url}
            alt={attachment.originalName}
            className={`rounded-lg border object-cover ${
              compact ? "h-24 w-full" : "max-h-72 w-full"
            }`}
          />
        </a>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg border bg-background/70 px-3 py-2"
      >
        <span className="rounded-full bg-muted p-2">
          <AttachmentIcon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {attachment.originalName}
          </span>
          <span className="block text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </span>
        </span>
      </a>
    );
  };

  const renderMessage = (chatMessage: ProjectChatMessageType) => {
    const isOwnMessage = chatMessage.sender?._id === user?._id;
    const hasAttachments = chatMessage.attachments.length > 0;

    return (
      <div
        key={chatMessage._id}
        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm md:max-w-[70%] ${
            isOwnMessage
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            {!isOwnMessage && (
              <Avatar className="size-8">
                <AvatarImage src={chatMessage.sender?.profilePicture || ""} />
                <AvatarFallback>
                  {chatMessage.sender?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {isOwnMessage ? "You" : chatMessage.sender?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(chatMessage.createdAt), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
            {isOwnMessage && !chatMessage.isDeletedBySender && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={isDeleting}
                onClick={() =>
                  deleteMessage({
                    workspaceId,
                    projectId,
                    messageId: chatMessage._id,
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>

          {chatMessage.message ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {chatMessage.message}
            </p>
          ) : null}

          {hasAttachments ? (
            <div className="mt-3 space-y-2">
              {chatMessage.attachments.map((attachment) => (
                <div key={attachment.publicId}>
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="size-5" />
              {projectData?.project?.emoji} {projectData?.project?.name} Chat
            </CardTitle>
            <CardDescription>
              Project members and administrators can collaborate here by
              sharing messages and files. Messages are retained unless they are
              manually removed.
            </CardDescription>
          </div>
          <Tabs
            value={currentTab}
            onValueChange={(value) => {
              if (value === "files") {
                setSearchParams({ tab: "files" });
                return;
              }

              setSearchParams({});
            }}
          >
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="files">Shared Files</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentTab === "chat" ? (
          <>
            <ScrollArea className="h-[52vh] rounded-xl border bg-slate-50/60 p-4">
              <div className="space-y-4 pr-4">
                {isPending ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading chat...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No messages have been shared yet. Start the conversation by
                    sending the first message.
                  </div>
                ) : (
                  messages.map(renderMessage)
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="rounded-xl border bg-white p-4">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message likhiye ya file attach kijiye..."
                className="min-h-28 resize-none border-0 px-0 shadow-none focus-visible:ring-0"
              />
              <Separator className="my-3" />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                    <Upload className="size-4" />
                    Attach files
                    <Input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {files.map((file) => (
                    <span
                      key={`${file.name}-${file.lastModified}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>

                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <ScrollArea className="h-[60vh] rounded-xl border bg-slate-50/60 p-4">
            <div className="grid gap-4 pr-4 md:grid-cols-2 xl:grid-cols-3">
              {isPending || isFetching ? (
                <div className="col-span-full flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading shared files...
                </div>
              ) : sharedFiles.length === 0 ? (
                <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  No shared files are available in this project yet.
                </div>
              ) : (
                sharedFiles.map(({ attachment, chatMessage }) => (
                  <div
                    key={`${chatMessage._id}-${attachment.publicId}`}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3">
                      {renderAttachment(attachment, true)}
                    </div>
                    <p className="truncate text-sm font-semibold">
                      {attachment.originalName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shared by {chatMessage.sender?.name} on{" "}
                      {format(new Date(chatMessage.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectChatPanel;
