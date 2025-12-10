"use client";
import React, { useState, useCallback } from "react";
import { ChatWindow } from "@/components/learners/chat-window";
import { MessageInput } from "@/components/learners/message-input";
import { AvatarWithStatus } from "@/components/chat/avatar";
import { ProfileModal } from "@/components/mentors/profile-modal";
import { useChat } from "@/hooks/use-chat-channel";
import { ChatMessage } from "@/types/chat";
import { useSelector } from "react-redux";

const ChatPage: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const partnerId = user?.assignedTo?.id;
  const [menteeId, mentorId, senderType] =
    user?.role === "mentor"
      ? [partnerId, user.id, "mentor" as const]
      : [user?.id, partnerId, "mentee" as const];

  const chatDocId = [mentorId, menteeId].sort().join("_");
  const channelName = `presence-chat-${chatDocId}`;

  const {
    messages,
    members,
    typingUsers,
    sendTypingEvent,
    sendMessageOptimistic,
    markAsRead,
  } = useChat({
    channelName,
    channelId: chatDocId,
    user: { id: user?.id ||user?.uid, name: user?.name, role: user?.role },
    partnerId: partnerId,
    senderType: senderType,
  });

  // const [mentor, setMentor] = useState<any | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Derive online state for the partner (mentor)
  const partnerOnline = Boolean(
    Object.keys(members || {}).find((id) => id === partnerId)
  );

 

  // handle message send (optimistic + upload)
  const handleSend = useCallback(
    async (payload: {
      text?: string;
      imageFile?: File | null;
      audioFile?: Blob | null;
    }) => {
      let fileUrl: string | undefined = undefined;
      let messageType: ChatMessage["type"] = "text";
      const content = payload.text || "";

      try {
        if (payload.imageFile) {
          const fd = new FormData();
          fd.append("file", payload.imageFile);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (!r.ok) throw new Error("Image upload failed");
          const data = await r.json();
          fileUrl = data.url;
          messageType = "image";
        }
        // B. Handle Audio Upload
        else if (payload.audioFile) {
          const fd = new FormData();
          fd.append("file", payload.audioFile);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (!r.ok) throw new Error("Audio upload failed");
          const data = await r.json();
          fileUrl = data.url;
          messageType = "audio";
        }
        await sendMessageOptimistic(content, messageType, fileUrl);
      } catch (err) {
        console.warn("send failed", err);
      }
    },
    [sendMessageOptimistic]
  );

  // typing handler -> call hook's sendTypingEvent
  const handleTyping = useCallback(() => {
    sendTypingEvent(channelName);
  }, [channelName, sendTypingEvent]);

  return (
    <div className="w-full h-[98vh] flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="p-3.5 flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 shrink-0">
        {user?.assignedTo ? (
          <AvatarWithStatus
            user={user?.assignedTo}
            online={partnerOnline}
            onClick={() => setShowProfile(true)}
          />
        ) : (
          <div className="text-sm text-muted">Loading partner…</div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto">
        <ChatWindow
          messages={messages as ChatMessage[]}
          currentUser={user}
          mentor={user?.assignedTo}
          onImageClick={() => {}}
          onMarkRead={(id: string) => markAsRead(id)}
          typingUsers={typingUsers}
        />
      </div>

      {/* Input */}
      <div className="shrink-0 mx-4">
        <MessageInput onSend={handleSend} sendTypingEvent={handleTyping} />
      </div>

      <ProfileModal
        user={user?.assignedTo}
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default ChatPage;
