import { ChatMessage } from "@/types/message";

export const mockMentor = {
  id: "mentor_001",
  name: "Dr. Clara Martins",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  isOnline: true,
  title: "Senior Frontend Engineer",
  specialization: "React, TypeScript & UI Engineering",
  experience: "8 years",
  bio: "I help learners build solid frontend foundations with practical guidance.",
};


export const mockStudent = {
  id: "student_120",
  name: "Yetunde Morenikeji",
  avatar: "https://randomuser.me/api/portraits/women/68.jpg",
};


export const mockMessages: ChatMessage[] = [
  // --- TODAY ---
  {
    id: "1",
    sender: "mentor",
    type: "text",
    content: "Good morning, Yetunde! How’s your progress on the dashboard layout?",
    timestamp: new Date().toISOString(),
    read: true,
  },
  {
    id: "2",
    sender: "student",
    type: "text",
    content: "Good morning! I’m almost done. I’m fixing the chat layout responsiveness now.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "3",
    sender: "mentor",
    type: "image",
    content:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=800",
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "4",
    sender: "student",
    type: "audio",
    content: "/mock/audio/voice-note-1.mp3",
    timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
    read: false,
  },

  // --- YESTERDAY ---
  {
    id: "5",
    sender: "mentor",
    type: "text",
    content:
      "Here are the UI guidelines I mentioned. Check the colors and spacing scale.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "6",
    sender: "student",
    type: "image",
    content:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    read: true,
  },

  // --- TWO DAYS AGO ---
  {
    id: "7",
    sender: "mentor",
    type: "audio",
    content: "/mock/audio/voice-feedback-2.mp3",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "8",
    sender: "student",
    type: "text",
    content: "Thank you! I'll implement this.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    read: true,
  },

  // --- LAST WEEK ---
  {
    id: "9",
    sender: "mentor",
    type: "text",
    content: "Welcome to the program! I'm excited to mentor you 🎉",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "10",
    sender: "student",
    type: "text",
    content: "Thank you so much! I'm happy to be here 😄",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    read: true,
  },
];

export const mockTypingState = {
  mentorTyping: false,
  studentTyping: false,
};

export const mockSocketEvents = [
  { event: "message:sent", data: mockMessages[1] },
  { event: "message:read", data: { messageId: "4" } },
  { event: "mentor:online", data: true },
  { event: "mentor:typing", data: true },
];
