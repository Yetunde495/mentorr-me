// types/chat.ts

export type MessageType = "text" | "image" | "audio" | "file";

export interface ChatMessage {
  id: string;                      // DB id; temporary id for optimistic UI
  channel: string;                 // pusher channel (chat-[mentorId]-[menteeId])

  senderId: string;
  receiverId: string;
  senderType: "mentor" | "mentee";  // determines alignment & styles in UI

  type: MessageType;               // text | image | audio | file
  content?: string;                // message text
  fileUrl?: string;                // for images, files, audio

  createdAt: string;               // ISO timestamp

  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}
