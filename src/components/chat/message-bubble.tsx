// File: components/MessageBubble.tsx
import React from 'react';
import { ChatMessage } from "@/types/chat";

export const MessageBubble: React.FC<{
  message: ChatMessage;
  isMine: boolean;
  onImageClick?: (url: string) => void;
}> = ({ message, isMine, onImageClick }) => {
  // base bubble style
  const bubbleStyle =
    message.type === "image" || message.type === "file"
      ? "" // no background for images/files
      : isMine
      ? "bg-orange-500 text-white rounded-2xl rounded-br-2xl"
      : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-2xl rounded-bl-2xl";

  return (
    <div
      className={`max-w-[80%] wrap-break-word p-3 transition-transform duration-150 ${
        isMine ? "self-end" : "self-start"
      } ${bubbleStyle}`}
    >
      {/* TEXT */}
      {message.type === "text" && (
        <div className="whitespace-pre-wrap">{message.content}</div>
      )}

      {/* IMAGE */}
      {message.type === "image" && message.fileUrl && (
        <img
          src={message.fileUrl}
          onClick={() => onImageClick && onImageClick(message.fileUrl!)}
          alt="uploaded"
          className="w-full max-w-xs rounded-xl cursor-pointer"
        />
      )}

      {/* AUDIO */}
      {message.type === "audio" && message.fileUrl && (
        <div className="mt-2 w-full bg-transparent p-0">
          <audio
            controls
            className="w-full h-10 rounded-xl overflow-hidden"
            preload="metadata"
          >
            <source src={message.fileUrl} />
          </audio>
        </div>
      )}

      {/* FILE */}
      {message.type === "file" && message.fileUrl && (
        <a
          href={message.fileUrl}
          download
          className="block mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Download file
        </a>
      )}

      {/* TIME + TICKS */}
      <div className="text-[10px] mt-1 text-right opacity-70 flex items-center justify-end gap-1">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {isMine && (
          <>
            {message.status === "sending" && "…"}
            {message.status === "sent" && "✓"}
            {message.status === "delivered" && "✓✓"}
            {message.status === "read" && "✓✓"}
            {message.status === "failed" && "⚠️"}
          </>
        )}
      </div>
    </div>
  );
};



