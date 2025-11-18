"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatWindow } from "@/components/learners/chat-window";
import { MessageInput } from "@/components/learners/message-input";
import { mockMessages } from "@/lib/mockdata";
import { AvatarWithStatus } from "@/components/chat/avatar";
import { ProfileModal } from "@/components/mentors/profile-modal";

const ChatPage: React.FC = () => {
  // const router = useRouter();
  // const mentorId = String(router.query.mentorId ?? "mentor-1");
  const mentorId = "mentor-1"
  const currentUserId = "student-123"; // replace with auth
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "";
  const [showProfile, setShowProfile] = useState(false);
  const { messages, mentor, sendMessage, markAsRead } = useChatSocket({
    userId: currentUserId,
    mentorId,
    wsUrl,
  });

  const handleSend = useCallback(
    async (payload: {
      text?: string;
      imageFile?: File | null;
      audioFile?: Blob | null;
    }) => {
      const body: any = {};
      if (payload.text) body.text = payload.text;

      if (payload.imageFile) {
        const fd = new FormData();
        fd.append("file", payload.imageFile);
        try {
          const r = await fetch(`/api/upload`, { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            body.imageUrl = data.url;
          }
        } catch (e) {
          console.error("image upload error", e);
        }
      }

      if (payload.audioFile) {
        const fd = new FormData();
        fd.append("file", payload.audioFile);
        try {
          const r = await fetch(`/api/upload`, { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            body.audioUrl = data.url;
          }
        } catch (e) {
          console.error("audio upload error", e);
        }
      }

      await sendMessage(body);
    },
    [sendMessage]
  );

  const onImageClick = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank");
  };

  return (
    <div className="w-full h-[98vh] flex flex-col bg-white dark:bg-black">
  {/* Header */}
  <div className="p-3.5 flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 shrink-0">
    {mentor && (
      <AvatarWithStatus
        user={mentor}
        onClick={() => setShowProfile(true)}
      />
    )}
  </div>

  {/* Scrollable Chat Window */}
  <div className="flex-1 overflow-y-auto">
    <ChatWindow
      messages={mockMessages}
      currentUser={{ id: currentUserId, name: 'You' }}
      mentor={mentor}
      onImageClick={onImageClick}
      onMarkRead={markAsRead}
    />
  </div>

  {/* Input Bar */}
  <div className="shrink-0">
    <MessageInput onSend={handleSend} />
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
