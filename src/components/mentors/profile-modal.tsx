"use client";
import { Mentor, User } from "@/types/user";
import axios from "axios";
import { useMemo, useState } from "react";
import Avatar from "../ui/avatar";

export const ProfileModal: React.FC<{
  user: User | null;
  show: boolean;
  onClose: () => void;
}> = ({ user, show, onClose }) => {
  if (!user) return null;
  const [mentorData, setMentorData] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch mentor profile
  useMemo(async () => {
    try {
      const res = await axios.get(`/api/users/${user?.id}`);
      setMentorData(res?.data?.user || null);
    } catch (err) {
      console.warn("fetch partner profile error", err);
    }
  }, [user?.id]);
  return (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${
        show ? "" : "hidden"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[min(600px,95%)]"
      >
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} src={mentorData?.photoURL} />
          <div>
            <div className="text-lg font-semibold">{user.name}</div>

            {loading ? (
              <div className="text-sm text-gray-500 flex flex-col py-6 gap-1 w-full justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>

                <p>Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  {mentorData?.profession}
                </div>
                <div className="mt-3 text-sm">
                  {mentorData?.bio || "No bio available."}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
