"use client";

import React, { useMemo, useState } from "react";
import { groupMessagesByDate } from "@/lib/utils";
import { MessageBubble } from "../chat/message-bubble";
import { User } from "@/types/user";
import { ChatMessage } from "@/types/chat";

export const ChatWindow: React.FC<{
  messages: ChatMessage[];
  currentUser: User;
  mentor: User | null;
  typingUsers?: Record<string, { name: string; at: string }>;
  onImageClick?: (url: string) => void;
  onMarkRead?: (id: string) => void;
}> = ({
  messages,
  currentUser,
  mentor,
  typingUsers,
  onImageClick,
  onMarkRead,
}) => {
  const groups = useMemo(() => groupMessagesByDate(messages), [messages]);

  const typingUserNames = Object.values(typingUsers || {})
    .map((u) => u.name)
    .join(", ");

    console.log(messages)

  return (
    <div className="flex-1 flex flex-col h-full mx-auto max-w-5xl">
      {/* Chat body */}
      <div className="flex-1 p-4 flex flex-col gap-4" id="chat-scroll">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-col gap-3">
            {/* Date label */}
            <div className="self-center bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
              {group.date}
            </div>

            {/* Messages */}
            {group.items.map((msg: ChatMessage) => {
              const isMine = msg.senderId === currentUser.id || msg.senderId === currentUser?.uid;

              return (
                <div
                  key={msg.id}
                  className="flex w-full"
                  onMouseEnter={() => {
                    if (!isMine && onMarkRead) onMarkRead(msg.id);
                  }}
                >
                  <div
                    className={`flex w-full ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <MessageBubble
                      message={msg}
                      isMine={isMine}
                      onImageClick={onImageClick}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUserNames && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <div className="italic">{typingUserNames} is typing...</div>
          </div>
        )}
      </div>
    </div>
  );
};
