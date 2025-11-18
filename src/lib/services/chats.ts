import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5173/api/v1";

let accessToken: string | null = null;
let refreshToken: string | null = null;

// ---- Types (aligning with README) ----
export type ID = string;
export type ParticipantRole = "patient" | "doctor" | "assistant";
export type ConversationStatus = "active" | "archived" | "urgent";
export type ConversationType = "patient_practitioner" | "group" | "support";
export type MessageType = "text" | "image" | "file" | "system";
export type Sender = {
  _id: string;
  firstName: string;
  lastName: string;
  role: ParticipantRole;
  displayName: string;
  fullName: string;
  id: string;
};

export interface Participant {
  userId: Sender;
  role: ParticipantRole;
  name: string;
  unreadCount: number;
  lastActivity?: string;
}

export interface Conversation {
  _id: ID;
  title: string;
  type: ConversationType;
  status: ConversationStatus;
  isUrgent?: boolean;
  tags?: string[];
  participants: Participant[];
  lastMessage?: { content: string; timestamp: string; sender: ID } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  type: "image" | "file";
  url: string;
  name?: string;
}

export interface Message {
  _id: ID;
  conversationId: ID;
  senderId: Sender;
  content: string;
  attachments?: Attachment[];
  status?: "sending" | "sent" | "delivered" | "read";
  replyTo?: ID;
  isUrgent?: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  isEncrypted?: boolean;
  messageType: MessageType;
  phiAccess?: boolean;
  readBy?: Array<string>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: T;
}

// ---- Axios instance ----
// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add any additional headers if needed
api.interceptors.request.use(
  (config) => {
    // inside request interceptor
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle authentication errors
// Response interceptor → refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const token = sessionStorage.getItem("refreshToken");
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token,
        });

        const newAccessToken = res.data?.data?.tokens?.accessToken;
        const newRefreshToken = res.data?.data?.tokens?.refreshToken;

        if (newAccessToken) {
          sessionStorage.setItem("accessToken", newAccessToken);
          sessionStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // alert("Session expired. Please, login again.");
        // window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

const unwrap = <T>(p: Promise<any>): Promise<T> =>
  p
    .then((r) => r.data)
    .catch((e: any) => {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Request failed";
      throw new Error(msg);
    });

// ---- Conversations API ----
export const conversationsAPI = {
  list: (params: any = {}) =>
    unwrap<
      ListResponse<{ conversations: Conversation[]; pagination: Pagination }>
    >(api.get(`/conversations`, { params })),
  create: (body: any) =>
    unwrap<ListResponse<{ conversation: Conversation }>>(
      api.post(`/conversations`, body),
    ),
  getById: (id: ID) =>
    unwrap<ListResponse<{ conversation: Conversation }>>(
      api.get(`/conversations/${id}`),
    ),
  addParticipants: (id: ID, body: any) =>
    unwrap(api.post(`/conversations/${id}/participants`, body)),
  archive: (id: ID, reason?: string) =>
    unwrap(api.post(`/conversations/${id}/archive`, { reason })),
  markUrgent: (id: ID, isUrgent: boolean, reason?: string) =>
    unwrap(api.post(`/conversations/${id}/urgent`, { isUrgent, reason })),
};

// ---- Messages API ----
export const messagesAPI = {
  listByConversation: (conversationId: ID, params: any = {}) =>
    unwrap<
      ListResponse<{
        messages: Message[];
        pagination: Pagination;
        conversation: Conversation;
      }>
    >(api.get(`/conversations/${conversationId}`, { params })),
  send: (body: any) =>
    unwrap<ListResponse<Message>>(api.post(`/messages`, body)),
  getById: (id: ID) =>
    unwrap<ListResponse<{ message: Message }>>(api.get(`/messages/${id}`)),
  edit: (id: ID, body: any) =>
    unwrap<ListResponse<{ message: Message }>>(
      api.put(`/messages/${id}`, body),
    ),
  remove: (id: ID) => unwrap(api.delete(`/messages/${id}`)),
  markRead: (id: ID) => unwrap(api.post(`/messages/${id}/read`)),
  search: (params: any) =>
    unwrap<ListResponse<{ messages: Message[]; pagination: Pagination }>>(
      api.get(`/messages/search`, { params }),
    ),
};

export default api;
