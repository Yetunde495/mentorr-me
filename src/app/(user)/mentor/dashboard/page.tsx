"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { db } from "@/lib/services/firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import Avatar, { ImageAvatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Zap } from "lucide-react";
import { setCurrentChat } from "@/features/chatSlice";

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
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const assignedMentees = user?.assignedMentees || [];
  const dispatch = useDispatch();

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);


   const handleChatNavigation = (chat: any) => {
      dispatch(setCurrentChat(chat));
      router.push(`/mentor/chat/${chat?.chatId}`);
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
      <div className="p-8 min-h-screen">
        <div
          style={{ backgroundImage: `url('/mentor-bg.png')` }}
          className="w-full rounded-[30px] bg-no-repeat bg-top bg-cover py-10 lg:px-12 md:px-8 px-6"
        >
          <div className="lg:w-[55%] w-full flex flex-col gap-3">
            <h1 className="font-header text-zinc-900 md:text-2xl text-xl font-semibold">
              Welcome, {user.name}!
            </h1>
            <p className="text-zinc-800 font-medium">
              You currently do not have any mentees assigned to you. Once an
              administrator pairs you with a mentee, they will appear below and
              you can start chatting!
            </p>

            <a
              href="/"
              className="hover hover:cursor-pointer text-lg font-semibold text-zinc-900"
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
      <div className="pb-8">
        <div
          style={{ backgroundImage: `url('/mentor-bg.png')` }}
          className="w-full rounded-[30px] bg-no-repeat bg-top bg-cover py-10 lg:px-12 md:px-8 px-6"
        >
          <div className="lg:w-[55%] w-full flex flex-col gap-3">
            <h1 className="font-header text-zinc-900 md:text-2xl text-xl font-semibold">
              Welcome, {user.name}!
            </h1>
            <p className="text-zinc-800 font-medium">
              You currently have {assignedMentees?.length || 0} active mentee(s).
              Tap 'Start Chat' to jump straight
              into their conversation room and begin guiding them on their
              journey.
            </p>
          </div>
        </div>
      </div>
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
            className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-md shadow-orange-300 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div>
              <div className="flex items-start space-x-4 mb-4">
                <Avatar src={mentee.photoURL} name={mentee.name} className="" />
                <div className="flex-1 pt-1">
                  <h2 className="text-xl font-semibold">{mentee.name}</h2>
                  <p className="text-sm truncate">{mentee?.email}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm pt-3">
                  <span className="font-medium block mb-1">Mentee Bio:</span>
                  {mentee.bio || "No bio specified."}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleChatNavigation(mentee)}
              className="mt-6 w-full flex items-center justify-center px-4 py-2.5 text-lg font-medium text-white bg-black rounded-lg hover:bg-black/90 dark:bg-white dark:text-orange-500 dark:hover:bg-white/90 transition-colors shadow-xl transform hover:scale-[1.01] active:scale-[0.99]"
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
