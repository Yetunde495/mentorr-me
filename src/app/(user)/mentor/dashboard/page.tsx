"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "@/lib/services/firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import { ImageAvatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Zap } from "lucide-react";

interface AssignedTo {
  id: string;
  name: string;
  photoURL?: string;
  chatId?: string;
}

interface UserProfile {
  id: string;
  role: "mentee" | "mentor" | "admin";
  assignedTo: AssignedTo | null;
}

const MentorDashboard = () => {
  const user = useSelector((state: any) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);

  const assignedMentees = user?.assignedMentees || [];

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  const handleChatNavigation = (chatId: string) => {
    window.location.href = `/mentor/chat/${chatId}`;
  };

  if (isLoading || !user) {
    return (
      <div className="p-8 flex items-center justify-center h-full min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <p className="text-xl text-neutral-500">Loading mentor profile...</p>
      </div>
    );
  }

  // --- 1. No Assigned Mentees ---
  if (assignedMentees.length === 0) {
    return (
      <div className="p-8 min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div
          style={{ backgroundImage: `url('/mentor-bg.png')` }}
          className="w-full rounded-[30px] bg-no-repeat bg-center bg-cover py-16 lg:px-12 md:px-8 px-6 bg-blue-50/50 dark:bg-neutral-800/50 shadow-lg"
        >
          <div className="lg:w-[55%] w-full flex flex-col gap-3 backdrop-blur-sm bg-white/70 dark:bg-neutral-900/70 p-6 rounded-xl">
            <h1 className="font-header text-zinc-800 dark:text-zinc-100 md:text-2xl text-xl font-semibold">
              Welcome, {user.name}!
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              Thank you for being a mentor. You currently do not have any
              mentees assigned to you. Once an administrator pairs you with a
              mentee, they will appear below and you can start chatting!
            </p>

            <a
              href="/"
              className="mt-4 inline-block w-fit text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 border-b pb-3 border-neutral-200 dark:border-neutral-700">
        My Assigned Mentees ({assignedMentees.length})
      </h1>

      <motion.div
        className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {assignedMentees.map((mentee: any) => (
          <motion.div
            key={mentee.id}
            className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div>
              <div className="flex items-start space-x-4 mb-4">
                <ImageAvatar
                  src={mentee.photoURL}
                  name={mentee.name}
                  className="w-16 h-16 min-w-16"
                />
                <div className="flex-1 pt-1">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {mentee.name}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {mentee.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">
                  <Zap className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium">Skill Focus:</span>{" "}
                  {mentee.skillFocus || "Not Specified"}
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-3">
                  <span className="font-medium block mb-1 text-neutral-900 dark:text-neutral-100">
                    Mentee Profile Notes:
                  </span>
                  {
                    "This is where a summary of the mentee's bio and experience would be displayed. Click 'Start Chat' to view their full profile within the conversation."
                  }
                </p>
              </div>
            </div>

            <button
              onClick={() => handleChatNavigation(mentee.chatId)}
              className="mt-6 w-full flex items-center justify-center px-4 py-2.5 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xl transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chat
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MentorDashboard;
