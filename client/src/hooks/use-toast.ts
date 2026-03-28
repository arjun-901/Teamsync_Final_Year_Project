"use client";

import * as React from "react";
import { Id, ToastContent, toast as notify, UpdateOptions } from "react-toastify";

type ToastVariant = "default" | "success" | "destructive";

type ToasterToast = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
};

const normalizeText = (value?: React.ReactNode) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const normalizedPhrases: Array<[RegExp, string]> = [
    [/invalid credentials/i, "Invalid email or password."],
    [/already registered/i, "This account is already registered."],
    [/email already exists/i, "This email address is already registered."],
    [/user(name)? already exists/i, "This username is already registered."],
    [/workspace name is required/i, "Workspace name is required."],
    [/message required/i, "Please enter a message or attach at least one file."],
    [/unauthorized/i, "You are not authorized to perform this action."],
  ];

  const matched = normalizedPhrases.find(([pattern]) => pattern.test(trimmed));
  const base = matched ? matched[1] : trimmed;
  const capitalized = base.charAt(0).toUpperCase() + base.slice(1);

  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
};

const getToastTitle = (variant: ToastVariant, title?: React.ReactNode) => {
  const normalized = normalizeText(title);
  if (
    normalized &&
    typeof normalized === "string" &&
    !["Error.", "Success.", "Notice."].includes(normalized)
  ) {
    return normalized;
  }

  if (variant === "success") return "Success";
  if (variant === "destructive") return undefined;
  return "Notice";
};

const getToastBody = (description?: React.ReactNode) => {
  const normalized = normalizeText(description);
  return normalized || undefined;
};

const renderToastContent = (
  variant: ToastVariant,
  title?: React.ReactNode,
  description?: React.ReactNode
): ToastContent => {
  const heading = getToastTitle(variant, title);
  const body = getToastBody(description);
  const primaryText = heading || body;
  const secondaryText = heading ? body : undefined;

  return React.createElement(
    "div",
    { className: "space-y-1" },
    primaryText
      ? React.createElement(
          "div",
          {
            className: heading
              ? "text-sm font-semibold leading-5 text-slate-950"
              : "text-sm font-semibold leading-5 text-slate-950",
          },
          primaryText
        )
      : null,
    secondaryText
      ? React.createElement(
          "div",
          { className: "text-sm leading-5 text-slate-600" },
          secondaryText
        )
      : null
  );
};

const getToastOptions = (variant: ToastVariant) => {
  if (variant === "success") {
    return {
      type: "success" as const,
      className:
        "!rounded-2xl !border !border-emerald-200 !bg-white !shadow-xl",
      progressClassName: "!bg-emerald-500",
    };
  }

  if (variant === "destructive") {
    return {
      type: "error" as const,
      className:
        "!rounded-2xl !border !border-rose-200 !bg-white !shadow-xl",
      progressClassName: "!bg-rose-500",
    };
  }

  return {
    type: "default" as const,
    className: "!rounded-2xl !border !border-slate-200 !bg-white !shadow-xl",
    progressClassName: "!bg-blue-500",
  };
};

type Toast = Omit<ToasterToast, "id">;

function toast({ title, description, variant = "default" }: Toast) {
  const toastId = notify(renderToastContent(variant, title, description), {
    ...getToastOptions(variant),
    position: "bottom-right",
    autoClose: 3200,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  const dismiss = () => notify.dismiss(toastId);
  const update = (props: Partial<ToasterToast>) => {
    const nextVariant = props.variant || variant;
    notify.update(toastId, {
      render: renderToastContent(nextVariant, props.title ?? title, props.description ?? description),
      ...getToastOptions(nextVariant),
    } as UpdateOptions);
  };

  return {
    id: String(toastId),
    dismiss,
    update,
  };
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: (toastId?: string) => notify.dismiss(toastId as Id | undefined),
  };
}

export { useToast, toast };
