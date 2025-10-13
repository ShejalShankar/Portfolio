"use client";

import { useTambo, useTamboThread } from "@tambo-ai/react";
import { CanvasSpace } from "app/components/tambo/canvas-space";
import type { messageVariants } from "app/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "app/components/tambo/message-input";
import { ScrollableMessageContainer } from "app/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "app/components/tambo/thread-content";
import type { VariantProps } from "class-variance-authority";
import { cn } from "lib/utils";
import { MessageSquare, PanelRightClose, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  contextKey?: string;
  hotkey?: string;
  variant?: VariantProps<typeof messageVariants>["variant"];
}

export const ControlBar = React.forwardRef<HTMLDivElement, ControlBarProps>(
  ({ className, contextKey, hotkey = "mod+k", variant, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [isMinimalMode, setIsMinimalMode] = React.useState(true);
    const isMac =
      typeof navigator !== "undefined" && navigator.platform.startsWith("Mac");

    const { thread } = useTambo();
    const { cancel, isIdle } = useTamboThread();

    // Handle minimal mode toggle event
    React.useEffect(() => {
      window.dispatchEvent(
        new CustomEvent("tambo:minimalModeChanged", {
          detail: { isMinimalMode: isMinimalMode || !open },
        })
      );
    }, [isMinimalMode, open]);

    // Ensure we're mounted before rendering portal
    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Hotkey toggle
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        const [modifier, key] = hotkey.split("+");
        const isModifierPressed =
          modifier === "mod" ? e.metaKey || e.ctrlKey : false;
        if (e.key === key && isModifierPressed) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, [hotkey]);

    // Close on ESC
    React.useEffect(() => {
      if (!open) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open]);

    const modalContent = open ? (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/40 z-[9998]"
          onClick={() => setOpen(false)}
        />

        {/* Split Layout Container */}
        <div className="fixed inset-0 z-[9999] flex">
          {/* Canvas Space */}
          <div className={cn("relative flex-1")}>
            <CanvasSpace className="h-full border-none bg-white/70 dark:bg-neutral-900/70" />

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className={cn(
                "absolute top-4 left-4 z-10 w-10 h-10 bg-white/80 dark:bg-neutral-900/80",
                "border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-sm hover:shadow-md transition-all",
                "flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle chat button */}
            <button
              onClick={() => setIsMinimalMode(!isMinimalMode)}
              className={cn(
                "absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 dark:bg-neutral-900/80",
                "border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-sm hover:shadow-md transition-all",
                "flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              )}
              aria-label={isMinimalMode ? "Show chat" : "Hide chat"}
            >
              {isMinimalMode ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <PanelRightClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Right-hand Chat Panel */}
          <div
            ref={ref}
            className={cn(
              "w-[440px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm h-full flex flex-col shadow-lg transition-all duration-300",
              isMinimalMode && "sr-only",
              className
            )}
            {...props}
          >
            <div className="flex flex-col h-full p-4 gap-4">
              <div className="flex-1 min-h-0">
                {thread?.messages?.length > 0 && (
                  <ScrollableMessageContainer className="h-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 overflow-y-auto">
                    <ThreadContent variant={variant}>
                      <ThreadContentMessages />
                    </ThreadContent>
                  </ScrollableMessageContainer>
                )}
              </div>

              {!isMinimalMode && (
                <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg p-3">
                  <MessageInput contextKey={contextKey}>
                    <MessageInputTextarea placeholder="Ask me anything or paste a job link..." />
                    <MessageInputToolbar>
                      <MessageInputSubmitButton />
                    </MessageInputToolbar>
                    <MessageInputError />
                  </MessageInput>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    ) : null;

    return (
      <>
        {/* Floating Trigger Button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className={cn(
            "fixed bottom-6 right-6 z-50 w-12 h-12 bg-white dark:bg-neutral-900",
            "border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-sm hover:shadow-md transition-all",
            "flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 animate-pulse-wave"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-8 right-0 text-xs text-neutral-400 dark:text-neutral-500 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
            {isMac ? "⌘" : "Ctrl"}+K
          </span>
        </button>

        {mounted && createPortal(modalContent, document.body)}
      </>
    );
  }
);

ControlBar.displayName = "ControlBar";
