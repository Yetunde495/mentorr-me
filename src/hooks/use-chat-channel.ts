import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { ChatMessage } from "@/types/chat";
import { auth } from "@/lib/services/firebase";
import axios from "axios";
import { toast } from "sonner";

// Add partner ID and sender role to the hook options
interface UseChatOptions {
  channelName: string | null | undefined;
  channelId: string;
  user: { id: string; name: string; role: string };
  partnerId: string; // The ID of the other user in the chat
  senderType: "mentor" | "mentee"; // The role of the current user
}

function useChatChannel(
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

/**
 * useChat manages:
 * - presence (online users)
 * - typing indicators
 * - new-message binding
 * - receipts (delivered/read)
 * - optimistic UI helper functions (sendMessage)
 * - multi-device sync via pusher events
 */
export function useChat({
  channelName,
  user,
  partnerId,
  senderType,
  channelId,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<Record<string, any>>({});
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { name: string; at: string }>
  >({});
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const authUser = auth.currentUser;

  const chatId = channelName;

  // helper: load initial history
  const loadHistory = useCallback(
    async (channel: string) => {
      if (!authUser) return; // Cannot fetch without an authenticated user

      try {
        // 1. Get the Firebase ID token for secure server authentication
        const token = await authUser.getIdToken();

        // 2. Use axios for a simpler, centralized request structure
        const response = await axios.get(
          `/api/chat/${encodeURIComponent(channel)}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token for server verification
            },
          }
        );

        // 3. Axios handles the 2xx status check automatically.
        // If the request succeeds, process the data.
        console.log(response);
        const data = response.data;

        setMessages(data.messages ?? []);
      } catch (error) {
        // 4. Centralized error handling using sonner
        console.log(error);
        let errorMessage =
          "Failed to load chat history. Please try refreshing.";

        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;

          if (status === 401 || status === 403) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (status === 404) {
            errorMessage =
              "Chat not found or recently created. Try again in a moment.";
          } else {
            // Generic API error (e.g., 500 from server)
            errorMessage = `Server Error (${status}): Could not retrieve messages.`;
          }
        }

        console.error("loadHistory error:", error);

        // Display the user-friendly toast message
        toast.error(errorMessage);
      }
    },
    [authUser]
  );

  useEffect(() => {
    if (!channelName) return;

    // init pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: "/api/pusher/auth",
    });
    pusherRef.current = pusher;

    // presence channel
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
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev.concat(); // no change
        return [...prev, { ...data, status: "sent" }];
      });
      console.log('binded')

      // if (data.senderId !== user.id) {
      //   fetch("/api/pusher/receipt", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       channel: channelName,
      //       messageId: data.id,
      //       type: "delivered",
      //     }),
      //   }).catch((e) => console.warn("receipt error", e));
      // }
    });

    // Typing indicator
    channel.bind(
      "typing",
      (d: { userId: string; name: string; at: string }) => {
        if (d.userId === user.id) return;

        setTypingUsers((prev) => ({
          ...prev,
          [d.userId]: { name: d.name, at: d.at },
        }));

        const timeoutKey = `typingTimeout_${d.userId}`;
        const existingTimeout = (window as any)[timeoutKey];
        if (existingTimeout) {
          window.clearTimeout(existingTimeout);
        }

        // Set new timeout for cleanup after 4s
        const newTimeout = window.setTimeout(() => {
          setTypingUsers((prev) => {
            const copy = { ...prev };
            delete copy[d.userId];
            return copy;
          });
          delete (window as any)[timeoutKey];
        }, 4000) as unknown as number;

        (window as any)[timeoutKey] = newTimeout;
      }
    );

    // Receipts (delivered/read)
    channel.bind(
      "message-receipt",
      (payload: {
        messageId: string;
        type: string;
        userId: string;
        at: string;
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? { ...m, status: payload.type as any }
              : m
          )
        );
      }
    );

    // You can define custom events like "message-updated" for edits or "message-deleted"
    channel.bind("message-updated", (payload: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === payload.id ? { ...m, ...payload } : m))
      );
    });

    // load history once
    loadHistory(channelId);

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
  const sendTypingEvent = useCallback(async (channel: string) => {
    // debounce: only send every 700ms max
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    try {
      const token = await authUser?.getIdToken();
      await fetch("/api/pusher/typing", {
        method: "POST", // ← ADD THIS
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // ← ALSO ADD THIS
        },
        body: JSON.stringify({ channel }),
      });
    } catch (err) {
      console.error(err);
    }

    // throttle future typing: allow next after 700ms
    typingTimeoutRef.current = window.setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 700) as unknown as number;
  }, []);

  // Optimistic send function signature now takes more specific message data
  async function sendMessageOptimistic(
    content: string,
    messageType: ChatMessage["type"] = "text",
    fileUrl?: string
  ) {
    if (!channelName) throw new Error("Missing channel");

    // Determine the IDs based on the sender's role
    const isMentor = senderType === "mentor";
    const mentorId = isMentor ? user.id : partnerId;
    const menteeId = isMentor ? partnerId : user.id;

    // ----------------------------------------------------
    // 1. CREATE OPTIMISTIC MESSAGE (LOCAL)
    // ----------------------------------------------------
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const tempMsg: ChatMessage = {
      // Use ChatMessage interface
      id: tempId,
      channel: channelName,
      senderId: user.id,
      receiverId: partnerId, // The receiver is the partner ID
      senderType: senderType,
      type: messageType,
      content: content,
      fileUrl: fileUrl,
      createdAt: new Date().toISOString(),
      status: "sending",
    } as ChatMessage; // Cast to ensure all required fields are present

    // Add optimistic message locally
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const token = await authUser?.getIdToken();
      const socket_id = pusherRef.current?.connection.socket_id;

      const apiPayload = {
        channelId: channelId,
        partnerId: partnerId,
        senderType: senderType,
        tempMessageId: tempId,
        messageContent: content,
        messageType: messageType,
        fileUrl: fileUrl,
        socket_id: socket_id,
        mentorId: mentorId,
        menteeId: menteeId,
        message: tempMsg,
      };
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) throw new Error("Failed to save message");

      const saved = await res.json();
      const permanentId = saved.messageId;
      const returnedTempId = saved.tempMessageId;

      // The server response `saved.persistedMessage` now contains the final
      // server-generated timestamp and structure.
      const savedMessage: ChatMessage = {
        ...saved.persistedMessage,
        id: saved.persistedMessage.id, // The actual DB ID
      };

      // Replace temp message in local state with the saved message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === returnedTempId
            ? {
                ...m,
                id: permanentId,
                status: "sent",
              }
            : m
        )
      );
      return savedMessage;
    } catch (err) {
      console.error("sendMessageOptimistic error", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
      toast.error("Message failed to send. Check connection.");
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
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: "read" } : m))
      );
    } catch (err) {
      console.warn("markAsRead error", err);
    }
  }

  return {
    messages,
    members,
    typingUsers,
    sendTypingEvent,
    sendMessageOptimistic: (
      content: string,
      type?: ChatMessage["type"],
      fileUrl?: string
    ) => sendMessageOptimistic(content, type, fileUrl),
    markAsRead,
    setMessages,
  };
}
