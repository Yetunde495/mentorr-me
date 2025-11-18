import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connect = (url: string): void => {
  const token = sessionStorage.getItem("accessToken");
  socket = io(url, {
    path: "/socket.io",
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: token ? { token } : undefined,
  });

  socket.on("connect", () => console.log("Connected to WebSocket server"));
  socket.on("connect_error", (error: any) => console.error("Connection error:", error));
  socket.on("disconnect", (reason: string) => console.log("Disconnected:", reason));
};

export const on = (event: string, callback: (data: any) => void): void => {
  if (!socket) return console.warn("No socket connection");
  socket.on(event, callback);
};

export const off = (event: string, callback?: (data: any) => void): void => {
  if (!socket) return;
  callback ? socket.off(event, callback) : socket.off(event);
};

export const emit = (
  event: string,
  data?: any,
  callback?: (ack?: any) => void
): void => {
  if (!socket) return console.warn("No socket connection");

  console.log(`[SOCKET EMIT] event: ${event}`, data); // 👈 log before emitting
  socket.emit(event, data, (ack?: any) => {
    console.log(`[SOCKET ACK] event: ${event}`, ack);
    if (callback) callback(ack);
  });
};

// Convenience wrappers
export const joinConversation = (conversationId: string) =>
  emit("join_conversation", { conversationId });
export const leaveConversation = (conversationId: string) =>
  emit("leave_conversation", { conversationId });
export const typingStart = (conversationId: string) => {
    emit("typing_start", { conversationId });
}
 
export const typingStop = (conversationId: string) =>
  emit("typing_stop", { conversationId });
export const updateStatus = (
  status: "online" | "offline",
  currentConversation?: string,
) => emit("update_status", { status, currentConversation });
// Subscribe to user online/offline updates
export const onUserStatusChanged = (
  callback: (data: { userId: string; status: "online" | "offline" }) => void
) => {
  on("user_status_changed", callback);
};
// Unsubscribe
export const offUserStatusChanged = (
  callback: (data: { userId: string; status: "online" | "offline" }) => void
) => {
  off("user_status_changed", callback);
};

export const disconnect = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
};



