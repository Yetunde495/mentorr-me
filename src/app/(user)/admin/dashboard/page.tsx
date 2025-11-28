// pages/admin/dashboard.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AnalyticsCards from "@/components/admin/analyticsCard";
import { getCookie } from "cookies-next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Trash2,
  User,
  Mail,
  Book,
  Briefcase,
  Users,
  UserCheck,
} from "lucide-react";
import AssignMentorModal from "@/components/admin/assign-mentor";

type User = {
  id: string;
  name: string;
  email: string;
  role: "mentor" | "mentee" | "admin";
  bio?: string;
  profession?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    profession: string;
    photoURL: string;
    bio: string;
  } | null;
  skillFocus?: "";
  photoURL?: "";
  accountSetup?: boolean;
  assignedMentees?:
    | Array<{
        id: string;
        name: string;
        email: string;
        photoURL: string;
        skillFocus: string;
      }>
    | [];
};

interface UsersApiResponse {
  users: User[];
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  totalUnassigned: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalMentors, setTotalMentors] = useState(0);
  const [totalMentees, setTotalMentees] = useState(0);
  const [totalUnassigned, setTotalUnassigned] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignView, setAssignView] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [role, setRole] = useState<"mentor" | "mentee" | "all">("all");
  const [assignedStatus, setAssignedStatus] = useState<
    "assigned" | "unassigned" | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = getCookie("access_token");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    // 1. Build Query Parameters
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (role && role !== "all") {
      params.append("role", role);
    }

    if (role === "mentee" && assignedStatus && assignedStatus !== "all") {
      params.append("assignedStatus", assignedStatus);
    }

    if (search) {
      params.append("search", search);
    }

    try {
      const url = `/api/admin/users`; // Base URL

      // 2. Use full Axios config object to explicitly set method and headers
      const response = await axios<UsersApiResponse>({
        method: "GET", // Explicitly setting the method
        url: url,
        params: params, // Passing the URLSearchParams object
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // 3. Update State
      setUsers(data.users);
      console.log("Fetched users:", data.users);
      setTotalMentors(data.totalMentors);
      setTotalMentees(data.totalMentees);
      setTotalUnassigned(data.totalUnassigned);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      // Handle Axios error response structure if available
      if (axios.isAxiosError(err) && err.response) {
        setError(
          `Error fetching data: ${err.response.status} - ${
            err.response.data.error || err.message
          }`
        );
      } else {
        setError("An unexpected network error occurred.");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT HOOK ---

  useEffect(() => {
    fetchUsers();
  }, [page, limit, role, assignedStatus, search]);

  // useEffect(() => {
  //   fetchUsers();
  // }, [page, role, assignedStatus, search]);

  return (
    <div className="px-[4%] py-[5%]">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span>Loading users...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section>
          <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>
          <AnalyticsCards
            totalMentors={totalMentors}
            totalMentees={totalMentees}
            totalUnassigned={totalUnassigned}
          />

          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name..."
              className="border p-2 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="mentor">Mentors</option>
              <option value="mentee">Mentees</option>
            </select>

            {role === "mentee" && (
              <select
                value={assignedStatus}
                onChange={(e) => setAssignedStatus(e.target.value as any)}
                className="border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            )}
          </div>

          {/* Users Table */}
          <table className="w-full bg-white text-zinc-600 dark:bg-gray-900/60 dark:border dark:border-gray-800 border border-slate-100 dark:text-zinc-200 py-4 rounded-2xl">
            <thead className="border-b p-2 rounded-2xl border-slate-100 dark:border-gray-800">
              <tr className="text-lg! text-left! font-normal!">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Assigned Mentor</th>
                <th className="py-2">Actions</th> {/* Add this */}
              </tr>
            </thead>
            <tbody className="rounded-2xl py-4">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b rounded-2xl border-slate-100 dark:border-gray-800 px-4 py-3"
                >
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    {u?.assignedTo ? "Assigned" : "Unassigned"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 cursor-pointer text-blue-500 rounded-md hover:text-blue-600 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => console.log(u.id)}
                        className="p-1.5 cursor-pointer text-red-500  rounded-md hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 w-full flex items-center text-sm gap-2">
            <button
              disabled={page === 1}
              className="p-1.5 bg-orange-500 text-white rounded-md"
              onClick={() => setPage((p) => p - 1)}
            >
              <ArrowLeft size={14} />
            </button>
            <p>Page {page}</p>
            <button
              disabled={users.length < limit}
              className="p-1.5 bg-orange-500 text-white rounded-md"
              onClick={() => setPage((p) => p + 1)}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[30px] backdrop-blur-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                    {selectedUser.name} ({selectedUser.role})
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {!assignView ? (
                  <div className="max-h-[70vh] overflow-auto h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>

                      <div className="">
                        <p className="text-sm text-gray-500 mb-1">Profession</p>
                        <p className="font-medium">
                          {selectedUser.profession || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Field of Mentorship
                        </p>
                        <p className="font-medium">
                          {selectedUser.skillFocus || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.assignedTo
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedUser.assignedTo ? "Assigned" : "Unassigned"}
                        </span>
                      </div>

                      <div className="">
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="font-medium">
                          {selectedUser?.bio || "No bio provided"}
                        </p>
                      </div>
                    </div>

                    {/* Mentee Specific Info */}
                    <div className="pt-4">
                      <div className="mb-4">
                        <div className="flex gap-2 items-center">
                          <p className="text-sm text-gray-500 mb-1">
                            Assigned Mentor
                          </p>
                        </div>

                        <div className="flex gap-2 items-center">
                          <p className="text-sm font-medium mb-1">
                            <div className="text-sm p-2 bg-gray-50 rounded">
                              <p className="font-medium">
                                {selectedUser.assignedTo?.name}
                              </p>
                              <p className="text-gray-600 text-xs">
                                {selectedUser.assignedTo?.profession ||
                                  "Not specified"}
                              </p>
                            </div>
                          </p>
                          {!selectedUser.assignedTo ? (
                            <button
                              onClick={() => setAssignView(true)}
                              className="bg-orange-500 text-white px-3 text-sm py-1 rounded-md hover:bg-orange-600 transition-colors"
                            >
                              Assign Mentor
                            </button>
                          ) : (
                            <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 transition-colors">
                              Change Mentor
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mentor Specific Info */}
                    <div className="py-4 border-t mt-4 border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-600 mb-3 flex items-center text-sm gap-2">
                          <Users size={18} />
                          Assigned Mentees (
                          {selectedUser.assignedMentees?.length || 0})
                        </h4>
                        <div className="space-y-3">
                          {selectedUser.assignedMentees?.map((mentee) => (
                            <div
                              key={mentee?.id}
                              className="border rounded-lg p-3"
                            >
                              <p className="font-medium">{mentee?.name}</p>
                              <p className="text-sm text-gray-600">
                                {mentee?.email}
                              </p>
                              <p className="text-sm text-blue-600 mt-1">
                                Field: {mentee?.skillFocus || "Not specified"}
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
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-auto h-full">
                    <AssignMentorModal
                      mentee={selectedUser!}
                      onClose={() => setAssignView(false)}
                      onAssignSuccess={() => {
                        // Refresh the user data
                        fetchUsers();
                        // Close both modals
                        setAssignView(false);
                        setIsModalOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
