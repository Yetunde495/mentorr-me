// File: components/MessageBubble.tsx
import { ChatMessage } from '@/types/message';
import React from 'react';


export const MessageBubble: React.FC<{
  message: ChatMessage;
  isMine: boolean;
  onImageClick?: (url: string) => void;
}> = ({ message, isMine, onImageClick }) => {
  // base bubble style (text/audio only)
  const bubbleStyle =
    message.type === "image"
      ? "" // no background for images
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
      {message.type === "image" && (
        <img
          src={message.content}
          onClick={() =>
            onImageClick && onImageClick(message.imageUrl ?? message.content)
          }
          alt="uploaded"
          className="w-full max-w-xs rounded-xl cursor-pointer"
        />
      )}

      {/* AUDIO */}
      {message.type === "audio" && (
          <div className="mt-2 w-full bg-transparent p-0">
    <audio
      controls
      className="w-full h-10 rounded-xl overflow-hidden"
      preload="metadata"
    >
      <source src={message.content} />
    </audio>
  </div>
      )}

      {/* TIME + TICKS */}
      <div className="text-[10px] mt-1 text-right opacity-70">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        {isMine && (message.read ? "✓✓" : "✓")}
      </div>
    </div>
  );
};


