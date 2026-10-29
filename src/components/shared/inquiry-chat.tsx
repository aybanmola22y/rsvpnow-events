"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  inquiryId: string;
  sender: "customer" | "staff";
  senderName: string;
  body: string;
  createdAt: string;
};

type CustomerAuth = {
  mode: "customer";
  number: string;
  email: string;
};

type StaffAuth = {
  mode: "staff";
  inquiryId: string;
  senderName?: string;
};

type Props = {
  auth: CustomerAuth | StaffAuth;
  title?: string;
  className?: string;
  compact?: boolean;
};

function formatStamp(value: string) {
  try {
    return new Intl.DateTimeFormat("en-SG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function InquiryChat({ auth, title = "Conversation", className, compact }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lenis = useLenis();
  const self = auth.mode;

  const freezePageScroll = useCallback(() => {
    const y = window.scrollY;
    return () => {
      window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });
      lenis?.scrollTo(y, { immediate: true });
    };
  }, [lenis]);

  const scrollListToEnd = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, []);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (auth.mode === "staff") {
        params.set("inquiryId", auth.inquiryId);
      } else {
        params.set("number", auth.number);
        params.set("email", auth.email);
      }
      const response = await fetch(`/api/inquiries/messages?${params.toString()}`, {
        credentials: "same-origin",
      });
      const data = (await response.json()) as { messages?: ChatMessage[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not load messages.");
      }
      const next = data.messages ?? [];
      setMessages((prev) => {
        if (
          prev.length === next.length &&
          prev.every((item, index) => item.id === next[index]?.id)
        ) {
          return prev;
        }
        return next;
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function send() {
    const text = body.trim();
    if (!text || sending) return;

    const restorePage = freezePageScroll();
    setSending(true);
    setError("");

    try {
      const payload =
        auth.mode === "staff"
          ? { as: "staff" as const, inquiryId: auth.inquiryId, body: text, senderName: auth.senderName }
          : { as: "customer" as const, number: auth.number, email: auth.email, body: text };
      const response = await fetch("/api/inquiries/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: ChatMessage; error?: string };
      if (!response.ok || !data.message) {
        throw new Error(data.error || "Could not send.");
      }
      setMessages((prev) => [...prev, data.message!]);
      setBody("");
      requestAnimationFrame(() => {
        scrollListToEnd();
        restorePage();
        inputRef.current?.focus({ preventScroll: true });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
      restorePage();
      inputRef.current?.focus({ preventScroll: true });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("flex flex-col border border-stone-200 bg-white", className)}>
      <div className="border-b border-stone-100 px-4 py-3">
        <p className="text-[11px] font-medium tracking-[0.14em] text-stone-400 uppercase">{title}</p>
        <p className="mt-1 text-xs text-stone-500">
          {self === "customer"
            ? "Message the RSVPNow team about this quotation."
            : "Reply to the customer on this request."}
        </p>
      </div>

      <div
        ref={listRef}
        className={cn(
          "flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4",
          compact ? "max-h-72 min-h-48" : "max-h-[28rem] min-h-64",
        )}
      >
        {loading ? (
          <p className="text-sm text-stone-400">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-stone-400">No messages yet. Say hello to start the thread.</p>
        ) : (
          messages.map((message) => {
            const mine =
              (self === "customer" && message.sender === "customer") ||
              (self === "staff" && message.sender === "staff");
            return (
              <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    mine ? "bg-neutral-950 text-white" : "bg-stone-100 text-stone-800",
                  )}
                >
                  <p className={cn("text-[10px] uppercase tracking-wide", mine ? "text-white/55" : "text-stone-400")}>
                    {message.sender === "staff" ? message.senderName || "RSVPNow" : message.senderName || "Customer"}
                    {" · "}
                    {formatStamp(message.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">{message.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-stone-100 p-4">
        <Textarea
          ref={inputRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={self === "customer" ? "Ask a question about your quotation…" : "Write a reply…"}
          className="min-h-20 resize-none rounded-md border-stone-300 shadow-none"
          maxLength={4000}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void send();
            }
          }}
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-stone-400">Ctrl/Cmd + Enter to send</p>
          <Button
            type="button"
            disabled={sending || !body.trim()}
            // Keep focus in the textarea so the browser/Lenis don't jump the page.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void send()}
            className={self === "customer" ? "rounded-none bg-ink text-white hover:bg-ink/90" : undefined}
          >
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
