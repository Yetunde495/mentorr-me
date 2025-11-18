export type Message = {
  id: string;
  fromId: string;
  toId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string; // ISO
  read?: boolean;
};

export type ChatMessage = {
  id: string;
  sender: "student" | "mentor";
  type: "text" | "image" | "audio";
  imageUrl?: string;
  audioUrl?: string;
  content: string;
  timestamp: string;
  read: boolean;
  fromId?: string;
  toId?: string;
};
