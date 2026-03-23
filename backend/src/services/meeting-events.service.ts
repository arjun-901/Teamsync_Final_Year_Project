import { Response } from "express";

type WorkspaceId = string;

type SseClient = {
  res: Response;
  workspaceId: WorkspaceId;
};

const workspaceClients = new Map<WorkspaceId, Set<Response>>();

const writeEvent = (res: Response, event: string, data: unknown) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const addWorkspaceSseClient = (workspaceId: string, res: Response) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Helps when behind proxies
  res.setHeader("X-Accel-Buffering", "no");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).flushHeaders?.();

  res.write(`: connected\n\n`);

  if (!workspaceClients.has(workspaceId)) {
    workspaceClients.set(workspaceId, new Set());
  }
  workspaceClients.get(workspaceId)!.add(res);

  const cleanup = () => {
    const set = workspaceClients.get(workspaceId);
    if (set) {
      set.delete(res);
      if (set.size === 0) workspaceClients.delete(workspaceId);
    }
  };

  res.on("close", cleanup);
  res.on("finish", cleanup);

  return () => cleanup();
};

export const broadcastWorkspaceEvent = (
  workspaceId: string,
  event: string,
  data: unknown
) => {
  const set = workspaceClients.get(workspaceId);
  if (!set || set.size === 0) return;

  for (const res of set) {
    try {
      writeEvent(res, event, data);
    } catch {
      try {
        res.end();
      } catch {
        // ignore
      }
      set.delete(res);
    }
  }

  if (set.size === 0) workspaceClients.delete(workspaceId);
};

