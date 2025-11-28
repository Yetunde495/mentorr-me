import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Book,
  Briefcase,
  UserCheck,
  ChevronDown,
  X,
} from "lucide-react";
import axios from "axios";
import { getCookie } from "cookies-next";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  profession?: string;
  field?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    profession: string;
    photoURL: string;
    bio: string;
  } | null
  assignedMentees?: Array<{
    id: string;
    name: string;
    email: string;
    photoURL: string;
    skillFocus: string;
  }> | null
}

interface AssignMentorModalProps {
  mentee: User;
  onClose: () => void;
  onAssignSuccess: () => void;
}

export default function AssignMentorModal({
  mentee,
  onClose,
  onAssignSuccess,
}: AssignMentorModalProps) {
  const [mentors, setMentors] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = getCookie("access_token");

  const fetchMentors = async (searchQuery = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        role: "mentor",
        limit: "50",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await axios.get("/api/admin/users", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMentors(response.data.users);
    } catch (err) {
      console.error("Failed to fetch mentors:", err);
      setError("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = async (mentorId: string) => {
  try {
    await axios.patch(
      `/api/admin/users/${mentee.id}/assign-mentor`,
      { mentorId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

   
    setSearch("");
    setExpandedMentor(null);
    setError(null);
    onAssignSuccess();
  } catch (err: any) {
    console.error("Failed to assign mentor:", err);
    
    // Enhanced error handling
    if (axios.isAxiosError(err) && err.response) {
      const errorMessage = err.response.data?.error || "Failed to assign mentor";
      setError(errorMessage);
    } else {
      setError("An unexpected error occurred while assigning mentor");
    }
  }
};

  // Fetch mentors when modal opens or search changes
  useEffect(() => {
    fetchMentors(search);
  }, [search]);

  return (
    <div>
      <motion.div className="">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Assign Mentor to {mentee.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Select a mentor from the list below
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search mentors by name"
              className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Mentors List */}
          {!loading && (
            <div className="space-y-4">
              {mentors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No mentors found{search && ` matching "${search}"`}
                </div>
              ) : (
                mentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Mentor Summary */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedMentor(
                          expandedMentor === mentor.id ? null : mentor.id
                        )
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-600 text-sm">
                            {mentor.name}
                          </h3>
                          <p className="text-gray-500 text-xs">
                            {mentor.profession || "No profession specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Assigned Mentees
                          </p>
                          <p className="font-semibold">
                            {mentor.assignedMentees?.length || 0}
                          </p>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedMentor === mentor.id ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={20} className="text-gray-400" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Collapsible Details */}
                    <AnimatePresence>
                      {expandedMentor === mentor.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-slate-200 pt-4">
                            <div className="grid grid-cols-1 gap-6">
                              {/* Mentor Details */}
                              <div>
                                <h4 className="font-medium mb-3 text-gray-700">
                                  Mentor Details
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-sm">
                                      {mentor.email}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Book
                                      size={16}
                                      className="text-gray-400 mt-0.5"
                                    />
                                    <span className="text-sm">
                                      {mentor.bio || "No bio provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Briefcase
                                      size={16}
                                      className="text-gray-400"
                                    />
                                    <span className="text-sm">
                                      {mentor.profession || "Not specified"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Assigned Mentees */}
                              <div>
                                <h4 className="font-medium mb-3 text-gray-700">
                                  Current Mentees (
                                  {mentor.assignedMentees?.length || 0})
                                </h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {mentor.assignedMentees?.map((mentee) => (
                                    <div
                                      key={mentee.id}
                                      className="text-sm p-2 bg-gray-50 rounded"
                                    >
                                      <p className="font-medium">
                                        {mentee.name}
                                      </p>
                                      <p className="text-gray-600 text-xs">
                                        {mentee?.skillFocus || 'Not specified'}
                                      </p>
                                    </div>
                                  )) || (
                                    <p className="text-gray-500 text-sm">
                                      No assigned mentees
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Select Button */}
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => handleSelectMentor(mentor.id)}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                              >
                                <UserCheck size={16} />
                                Select {mentor.name.split(" ")[0]}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
