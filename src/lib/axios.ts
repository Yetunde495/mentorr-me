import axios from "axios";

const API_BASE_URL =
   "http://localhost:5173/api/v1";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setHeaderTokens = (
  access: string | null,
  refresh: string | null,
) => {
  accessToken = access;
  refreshToken = refresh;
};


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

// Authentication API endpoints
export const authAPI = {
  // Sign in
  signIn: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  initiateConversation: (data: any) => api.post("/conversations", data),

  sendMessage: (data: any) => api.post("/messages", data),

  // Sign up
  signUp: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post("/auth/register", { ...userData, role: "doctor" }),

  // Verify email (for signup)
  verifyEmail: (code: string) => api.post("/auth/verify-email", { code }),

  //
  resendEmailVerification: (email: string) =>
    api.post("/auth/resend-email-verification", { email }),

  // Forgot password
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  // Verify forgot password code
  verifyForgotPasswordCode: (code: string) =>
    api.post("/auth/verify-forgot-password", { code }),

  // Reset password
  resetPassword: (code: string, newPassword: string) =>
    api.post("/auth/reset-password", {
      code,
      newPassword,
    }),

  // Sign out
  signOut: (refreshToken: string) => api.post("/auth/signout", refreshToken),

  // Update Profile
  updateProfile: (profileData: any) =>
    api.put("/auth/update-profile", profileData),

  // Get current user profile
  getProfile: () => api.get("/auth/profile"),

  // Refresh authentication status
  refreshAuth: () => api.post("/auth/refresh"),
};

// General API for protected routes
export const protectedAPI = {

  allLearners: (params: any = {}) =>
    unwrap<ListResponse<{ learner: any[]; pagination: Pagination }>>(
      api.get(`/learners`, { params }),
    ),

  fetchUserNotifications: async ({ queryKey }: any) => {
    let url = `/notification/all-notification/${queryKey[1]}?page=${queryKey[2]}`;
    let queryOptions = "";

    // page
    if (queryKey[3]) {
      queryOptions += `&items_per_page=${queryKey[3]}`;
    }

    //status
    if (queryKey[4] === false || queryKey[4]) {
      queryOptions += `&isRead=${queryKey[4]}`;
    }
    url += queryOptions;
    const response: any = await api.get(`${url}`).catch((e) => ({ error: e }));

    if (response && response?.error) {
      const err = response?.error?.response;
      const msg = err?.data?.message || err?.status;
      throw new Error(msg || "Request Failed");
    }

    return response?.data;
  },
  readNotification: async (
    notificationId: string | undefined | null,
    data: any,
  ) => {
    const response: any = await axios
      .patch(`/notification/mark-as-read/${notificationId}`, data)
      .catch((e) => ({ error: e }));

    // check error
    if (response?.error) {
      const err = response?.error?.response;
      const msg = err?.data?.msg || err?.statusText;
      throw new Error(msg);
    }

    return response?.data?.data;
  },

  // Any other protected endpoints can be added here
};

export default api;
