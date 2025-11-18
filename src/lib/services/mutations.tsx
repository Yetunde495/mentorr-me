import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { protectedAPI } from "../axios";



// Custom mutation hook for marking notifications as read
export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, payload }: { notificationId: string; payload: any }) =>
      protectedAPI.readNotification(notificationId, payload),

    onMutate: async (variables) => {
      // Optional: optimistic update could go here
      return undefined; // or context object if used later
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ALL_USER_NOTIFICATIONS"] });
      queryClient.invalidateQueries({ queryKey: ["USER_NOTIFICATIONS"] });
      toast.success("Notification marked as read");
    },

    onError: (error: any) => {
      toast.error(error?.message || "An error occurred! Please try again.");
    },

    onSettled: () => {
      // Optional cleanup or logging
    },

    retry: false, // Prevent automatic retries
  });
}

