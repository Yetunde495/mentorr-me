"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChatWindow } from "@/components/learners/chat-window";
import { MessageInput } from "@/components/learners/message-input";
import { AvatarWithStatus } from "@/components/chat/avatar";
import { ProfileModal } from "@/components/mentors/profile-modal";
import { useChat } from "@/hooks/use-chat-channel";
import { ChatMessage } from "@/types/chat";

const ChatPage: React.FC = () => {
  // replace with router or auth values as needed
  const mentorId = "mentor-1";
  const currentUser = { id: "student-123", name: "You" };

  // Use a presence channel name so the hook receives members info
  const channelName = `presence-chat-${mentorId}-${currentUser.id}`;

  // useChat returns messages, members, typingUsers, sendTypingEvent, sendMessageOptimistic, markAsRead
  const {
    messages,
    members,
    typingUsers,
    sendTypingEvent,
    sendMessageOptimistic,
    markAsRead,
    setMessages,
  } = useChat({
    channelName,
    user: { id: currentUser.id, name: currentUser.name },
  });

  const [mentor, setMentor] = useState<any | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // derive online state for mentor from members map (presence channel user_id keys)
  const mentorOnline = Boolean(
    Object.keys(members || {}).find((id) => id === mentorId)
  );

  // fetch mentor profile separately (optional — hook only loads messages/history)
  useEffect(() => {
    let mounted = true;
    async function loadMentor() {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(mentorId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setMentor(data.user || null);
      } catch (err) {
        console.warn("fetch mentor error", err);
      }
    }
    loadMentor();
    return () => {
      mounted = false;
    };
  }, [mentorId]);

  // handle message send (optimistic + upload)
  const handleSend = useCallback(
    async (payload: {
      text?: string;
      imageFile?: File | null;
      audioFile?: Blob | null;
    }) => {
      const body: any = { channel: channelName };

      if (payload.text) body.content = payload.text;

      // upload image if present
      if (payload.imageFile) {
        const fd = new FormData();
        fd.append("file", payload.imageFile);
        try {
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            body.imageUrl = data.url;
          }
        } catch (e) {
          console.error("image upload error", e);
        }
      }

      // upload audio if present
      if (payload.audioFile) {
        const fd = new FormData();
        fd.append("file", payload.audioFile);
        try {
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            body.audioUrl = data.url;
          }
        } catch (e) {
          console.error("audio upload error", e);
        }
      }

      // send via the hook's optimistic sender
      // sendMessageOptimistic expects content string — if you have attachments,
      // adapt the hook or send JSON string. Here we handle common case:
      const contentParts: string[] = [];
      if (body.content) contentParts.push(body.content);
      if (body.imageUrl) contentParts.push(`[image:${body.imageUrl}]`);
      if (body.audioUrl) contentParts.push(`[audio:${body.audioUrl}]`);
      const finalContent = contentParts.join(" ");

      try {
        await sendMessageOptimistic(finalContent);
      } catch (err) {
        // send failed -> you can surface error UI or retry
        console.warn("send failed", err);
      }
    },
    [channelName, sendMessageOptimistic]
  );

  // typing handler -> call hook's sendTypingEvent
  const handleTyping = useCallback(() => {
    sendTypingEvent(channelName);
  }, [channelName, sendTypingEvent]);

  // open image (same behaviour as before)
  const onImageClick = useCallback((url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank");
  }, []);

  return (
    <div className="w-full h-[98vh] flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="p-3.5 flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 shrink-0">
        {mentor ? (
          <AvatarWithStatus
            user={mentor}
            online={mentorOnline}
            // typing={Object.values(typingUsers).length > 0}
            onClick={() => setShowProfile(true)}
          />
        ) : (
          <div className="text-sm text-muted">Loading mentor…</div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto">
        <ChatWindow
          messages={messages as ChatMessage[]}
          currentUser={currentUser}
          mentor={mentor}
          onImageClick={onImageClick}
          onMarkRead={(id: string) => markAsRead(id)}
          typingUsers={typingUsers}
        />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <MessageInput onSend={handleSend} sendTypingEvent={handleTyping} />
      </div>

      <ProfileModal
        user={mentor}
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default ChatPage;