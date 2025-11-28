import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { ChatMessage } from "@/types/chat";

export function useChatChannel(
  channelName: string | null | undefined,
  onMessage: (data: any) => void
) {
  useEffect(() => {
    if (!channelName) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (data: any) => {
      onMessage(data); // append message to chat UI
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [channelName]);
}

type OnMessages = (msgs: ChatMessage[]) => void;

interface UseChatOptions {
  channelName: string | null | undefined;
  user: { id: string; name: string };
}

/**
 * useChat manages:
 * - presence (online users)
 * - typing indicators
 * - new-message binding
 * - receipts (delivered/read)
 * - optimistic UI helper functions (sendMessage)
 * - multi-device sync via pusher events
 */
export function useChat({ channelName, user }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<Record<string, any>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; at: string }>>({});
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  // helper: load initial history
  const loadHistory = useCallback(async (channel: string) => {
    try {
      const res = await fetch(`/api/messages?channel=${encodeURIComponent(channel)}`);
      if (!res.ok) return;
      const data = await res.json();
      // assume data.messages: ChatMessage[]
      setMessages(data.messages ?? []);
      // mark delivered to this user's devices (optional — you can call receipt endpoint)
    } catch (err) {
      console.error("loadHistory error", err);
    }
  }, []);

  useEffect(() => {
    if (!channelName) return;

    // init pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: "/api/pusher/auth",
      // enable stats if you want: disableStats: false
    });
    pusherRef.current = pusher;

    // presence channel gives members list and member_* events
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // subscription success (presence channels: members object passed)
    channel.bind("pusher:subscription_succeeded", (membersObj: any) => {
      // membersObj may be a pusher members object or count depending on channel type
      // we convert to a plain map of user_id -> user_info
      try {
        const plainMembers: Record<string, any> = {};
        if (membersObj && membersObj.each) {
          // presence members object (works with pusher-js)
          membersObj.each((member: any) => {
            plainMembers[member.id] = member.info;
          });
        } else if (typeof membersObj === "object") {
          // fallback: sometimes pusher returns raw object
          Object.keys(membersObj).forEach((k) => {
            plainMembers[k] = membersObj[k];
          });
        }
        setMembers(plainMembers);
      } catch (err) {
        console.warn("failed to parse members", err);
      }
    });

    channel.bind("pusher:member_added", (member: any) => {
      setMembers((prev) => ({ ...prev, [member.id]: member.info }));
    });

    channel.bind("pusher:member_removed", (member: any) => {
      setMembers((prev) => {
        const copy = { ...prev };
        delete copy[member.id];
        return copy;
      });
    });

    // New message
    channel.bind("new-message", (data: ChatMessage) => {
      // if message is from another device of this same user, we still add it,
      // but if that device already added optimistic message with temp id, replace it
      setMessages((prev) => {
        // if message.id already exists, skip
        if (prev.find((m) => m.id === data.id)) return prev.concat(); // no change
        return [...prev, { ...data, status: "sent" }];
      });

      // Optionally auto-send "delivered" receipt for other sender
      // If message.senderId !== user.id -> notify delivered
      if (data.senderId !== user.id) {
        // fire delivered receipt (non-blocking)
        fetch("/api/pusher/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: channelName,
            messageId: data.id,
            type: "delivered",
          }),
        }).catch((e) => console.warn("receipt error", e));
      }
    });

    // Typing indicator
    channel.bind("typing", (d: { userId: string; name: string; at: string }) => {
      if (d.userId === user.id) return; // ignore our own typing echoes
      setTypingUsers((prev) => ({ ...prev, [d.userId]: { name: d.name, at: d.at } }));
      // clear after 4s
      setTimeout(() => {
        setTypingUsers((prev) => {
          const copy = { ...prev };
          delete copy[d.userId];
          return copy;
        });
      }, 4000);
    });

    // Receipts (delivered/read)
    channel.bind("message-receipt", (payload: { messageId: string; type: string; userId: string; at: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === payload.messageId ? { ...m, status: payload.type as any } : m))
      );
    });

    // Multi-device sync event examples:
    // You can define custom events like "message-updated" for edits or "message-deleted"
    channel.bind("message-updated", (payload: any) => {
      setMessages((prev) => prev.map((m) => (m.id === payload.id ? { ...m, ...payload } : m)));
    });

    // load history once
    loadHistory(channelName);

    return () => {
      try {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      } catch (err) {
        console.warn("cleanup pusher", err);
      }
    };
  }, [channelName, loadHistory, user.id, user.name]);

  // Typing debounce & send
  const typingTimeoutRef = useRef<number | null>(null);
  const sendTypingEvent = useCallback(
    (channel: string) => {
      // debounce: only send every 700ms max
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      // immediate fire
      fetch("/api/pusher/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      }).catch(() => {});

      // throttle future typing: allow next after 700ms
      typingTimeoutRef.current = window.setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 700) as unknown as number;
    },
    []
  );

  // Optimistic send: returns a local temp message, then persists replace via DB flow
  async function sendMessageOptimistic(content: string) {
    if (!channelName) throw new Error("Missing channel");
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tempMsg: any = {
      id: tempId,
      channel: channelName,
      senderId: user.id,
      senderName: user.name,
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    // add optimistic message locally
    setMessages((prev) => [...prev, tempMsg]);

    // 1) persist to DB via your existing API
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channelName,
          content,
        }),
      });
      if (!res.ok) throw new Error("Failed to save message");
      const saved = await res.json();
      const savedMessage: ChatMessage = saved.message;

      // 2) notify server to broadcast saved message (so other devices receive DB id)
      await fetch("/api/pusher/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelName, message: savedMessage }),
      });

      // 3) replace temp message in local state with saved message
      setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMessage : m)));
      return savedMessage;
    } catch (err) {
      console.error("sendMessageOptimistic error", err);
      // mark sending failed
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)));
      throw err;
    }
  }

  // mark message as read (call from UI when user opens the chat or scrolls to message)
  async function markAsRead(messageId: string) {
    if (!channelName) return;
    try {
      await fetch("/api/pusher/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelName, messageId, type: "read" }),
      });
      // local update (optional, will be overwritten by event from pusher)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: "read" } : m)));
    } catch (err) {
      console.warn("markAsRead error", err);
    }
  }

  return {
    messages,
    members,
    typingUsers,
    sendTypingEvent,
    sendMessageOptimistic,
    markAsRead,
    setMessages, // expose for advanced use
  };
}

