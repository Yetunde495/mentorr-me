"use client";

import React, { useMemo, useState } from "react";

import { groupMessagesByDate } from "@/lib/utils";
import { MessageBubble } from "../chat/message-bubble";
import { ChatMessage } from "@/types/message";
import { User } from "@/types/user";

export const ChatWindow: React.FC<{
  messages: ChatMessage[];
  currentUser: User;
  mentor: User | null;
  onImageClick?: (url: string) => void;
  onMarkRead?: (id: string) => void;
}> = ({ messages, currentUser, mentor, onImageClick, onMarkRead }) => {
  const groups = useMemo(() => groupMessagesByDate(messages), [messages]);
  const [showProfile, setShowProfile] = useState(false);
  console.log(groups);
  return (
    <div className="flex-1 flex flex-col h-full mx-auto max-w-5xl">
      <div className="flex-1 p-4 flex flex-col gap-4" id="chat-scroll">
        {groups.map((g: any) => (
          <div key={g.label} className="flex flex-col gap-3">
            <div className="self-center bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
              {g.date}
            </div>
            {g?.items?.map((m: any) => (
              <div
                key={m.id}
                className={`flex w-full`}
                onMouseEnter={() => onMarkRead && onMarkRead(m.id)}
              >
                <div
                  className={`${
                    m.sender === "student"
                      ? "flex flex-row-reverse items-start"
                      : "flex items-start"
                  } flex-1 w-full`}
                >
                  <MessageBubble
                    message={m}
                    isMine={m.sender === "student"}
                    onImageClick={onImageClick}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
