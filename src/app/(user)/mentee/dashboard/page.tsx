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

const MenteeDashboard = () => {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [isChecking, setIsChecking] = useState(false);
  const [chatExists, setChatExists] = useState(false);

  // Check if Chat exists

  const checkAssignmentAndChat = useCallback(
    async (profile: UserProfile) => {
      const chatId = profile.assignedTo?.chatId;

      if (!chatId) {
        setChatExists(false);
        return;
      }

      try {
        setIsChecking(true);
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          setChatExists(true);
          return;
        }
        setChatExists(false);
      } catch (error: any) {
        toast.error(error?.message);
        setChatExists(false);
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user && user?.role === "mentee") {
      checkAssignmentAndChat(user as UserProfile);
    } else if (user) {
      // Handle non-mentee roles redirecting away or showing admin/mentor dashboard
      setIsChecking(false);
    }
  }, [user, checkAssignmentAndChat]);

  if (!user?.assignedTo?.id) {
    return (
      <div className="p-8">
        <div
          style={{ backgroundImage: `url('/mentee-bg.png')` }}
          className="w-full rounded-[30px] bg-no-repeat bg-top bg-cover py-10 lg:px-12 md:px-8 px-6"
        >
          <div className="lg:w-[55%] w-full flex flex-col gap-3">
            <h1 className="font-header text-zinc-800 md:text-2xl text-xl font-semibold">
              Welcome to your Dashboard!
            </h1>
            <p className="text-zinc-700">
              We're still working hard to find the perfect mentor match for you.
              You'll receive a notification and see a chat link appear here once
              you've been assigned!
            </p>

            <Link
              href="/"
              className="hove hover:cursor-pointer textlg font-semibold text-zinc-700"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Assigned, but chat redirection did not occur (displaying modal/loader)
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-white dark:bg-neutral-900">
        {/* Avatar Group */}
        <div className="relative flex gap-4 mb-8">
          {/* Mentee */}
          <ImageAvatar
            src={user?.photoURL}
            name={user?.name || "Mentee"}
            className=" left-0 top-6 -rotate-6 shadow-xl"
          />

          <ImageAvatar
            src={user?.assignedTo?.photoURL}
            name={user?.assignedTo?.name || "Mentor"}
            className="-ml-8 z-40 rotate-12 shadow-xl"
          />
        </div>

        {/* Congratulations Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="md:text-2xl text-xl font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Congratulations!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-neutral-700 dark:text-neutral-300 mt-2 max-w-sm"
        >
          We’ve matched you with{" "}
          <span className="font-medium text-primary-600 dark:text-primary-400">
            {user?.assignedTo?.name}
          </span>
          .
        </motion.p>

        {/* Subtext */}
        {isChecking && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mt-6 max-w-xs"
          >
            We’re currently setting up your chat room...
          </motion.p>
        )}

        {chatExists && (
          <button
            onClick={() =>
              router.push(
                `/mentee/chat/${[user?.id, user?.assignedTo?.id]
                  .sort()
                  .join("_")}`
              )
            }
            className="mt-6 px-4 md:px-6 py-2.5 text-lg hover:cursor-pointer bg-black text-white rounded-md shadow-sm font-medium hover:bg-black/90 transition-colors"
          >
            Go to Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default MenteeDashboard;
