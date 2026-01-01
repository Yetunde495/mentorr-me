"use client";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { ChatWindow } from "@/components/learners/chat-window";
import { MessageInput } from "@/components/learners/message-input";
import { AvatarWithStatus } from "@/components/chat/avatar";
import { ProfileModal } from "@/components/mentors/profile-modal";
import { useChat } from "@/hooks/use-chat-channel";
import { ChatMessage } from "@/types/chat";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightOpen, X } from "lucide-react";
import LabelingForm from "@/components/layout/form-sidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
      onClick={onClose}
    >
      {/* Drawer content (using Framer Motion for sliding) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </div>
  );
};

const MentorChatPage: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const currentChat = useSelector((state: any) => state.chat.currentChat);
  const partnerId = currentChat?.id;
  const senderType = "mentor" as const;

  const channelName = `presence-chat-${currentChat?.chatId}`;

  const {
    messages,
    members,
    typingUsers,
    sendTypingEvent,
    sendMessageOptimistic,
    // markAsRead,
  } = useChat({
    channelName,
    channelId: currentChat?.chatId,
    user: { id: user?.id || user?.uid, name: user?.name, role: user?.role },
    partnerId: partnerId,
    senderType: senderType,
  });

  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Control desktop sidebar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Control mobile drawer

  const partnerOnline = Boolean(
    Object.keys(members || {}).find((id) => id === partnerId)
  );

  const handleSend = useCallback(
    async (payload: {
      text?: string;
      imageFile?: File | null;
      audioFile?: Blob | null;
    }) => {
      let fileUrl: string | undefined = undefined;
      let messageType: ChatMessage["type"] = "text";
      const content = payload.text || "";

      try {
        // Assume API call logic is correctly implemented here
        if (payload.imageFile) {
          const fd = new FormData();
          fd.append("file", payload.imageFile);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (!r.ok) throw new Error("Image upload failed");
          const data = await r.json();
          fileUrl = data.url;
          messageType = "image";
        } else if (payload.audioFile) {
          const fd = new FormData();
          fd.append("file", payload.audioFile);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (!r.ok) throw new Error("Audio upload failed");
          const data = await r.json();
          fileUrl = data.url;
          messageType = "audio";
        }
        await sendMessageOptimistic(content, messageType, fileUrl);
      } catch (err) {
        console.warn("send failed", err);
      }
    },
    [sendMessageOptimistic]
  );

  const handleTyping = useCallback(() => {
    // sendTypingEvent(channelName);
  }, [channelName, sendTypingEvent]);

  console.log(typingUsers)

  const chatAreaVariants = {
    open: { width: "70%" },
    closed: { width: "100%" },
  };

  return (
    <div className="w-full h-[98vh] flex bg-white dark:bg-black overflow-hidden">
      {/* Chat Area (Main Content) - Uses Framer Motion for width transition */}
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={chatAreaVariants}
        transition={{ type: "tween", duration: 0.3 }}
        className="flex flex-col flex-1 w-full overflow-hidden" // w-full ensures it starts full width on mobile
      >
        {/* Header */}
        <div className="p-3.5 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            {currentChat ? (
              <AvatarWithStatus
                user={currentChat}
                online={partnerOnline}
                onClick={() => setShowProfile(true)}
              />
            ) : (
              <div className="text-sm text-muted">Loading mentee…</div>
            )}
          </div>

          {/* Toggle Button Container (Desktop/Mobile Specific) */}
          <div className="flex items-center">
            {/* Button for Mobile Drawer (Visible on md and smaller) */}
            <button
              className="p-2 md:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Labeling Form Drawer"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>

            {/* Button for Desktop Sidebar Toggle (Visible on md and up) */}
            <button
              className="p-2 hidden md:block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ChatWindow
            messages={messages as ChatMessage[]}
            currentUser={user}
            mentor={user} // The mentor is the current user in this context
            onImageClick={() => {}}
            onMarkRead={(id: string) => {}}
            typingUsers={typingUsers}
          />
        </div>

        {/* Input */}
        <div className="shrink-0 mx-4 py-2 border-t border-slate-200 dark:border-gray-800">
          <MessageInput onSend={handleSend} sendTypingEvent={handleTyping} />
        </div>
      </motion.div>

      {/* Right Sidebar (Desktop) - Uses Framer Motion for rendering */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "30%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="hidden md:block border-l border-slate-200 dark:border-gray-800 shrink-0 overflow-y-auto"
          >
            <div className="w-full h-full">
              <LabelingForm />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Drawer (Mobile) - Custom Component */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <LabelingForm />
      </MobileDrawer>

      <ProfileModal
        user={user?.assignedTo} // Show mentee profile
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default MentorChatPage;
