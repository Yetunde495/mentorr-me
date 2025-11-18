"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import Avatar from "../ui/avatar";
import { setUser } from "@/features/authSlice";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  const mentorChats =
    user?.role === "mentor"
      ? [
          {
            id: "1",
            name: "Chinonso",
            avatar: "/img/a1.png",
            lastMessage: "Okay mentor, thank you!",
          },
          {
            id: "2",
            name: "Maryam",
            avatar: "/img/a2.png",
            lastMessage: "I'll finish the assignment today.",
          },
        ]
      : [];

  return (
    <aside className="relative">
      <button
        className="md:hidden p-3 absolute top-4 left-4 z-30 bg-white dark:bg-black rounded-full shadow"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-black shadow-xl z-50 md:hidden"
      >
        {renderSidebarContent({
          user,
          role: user?.role,
          collapsed: false,
          mentorChats,
          darkMode,
          toggleRole: () => {
            dispatch(
              setUser({
                ...user,
                role: user?.role === "mentor" ? "student" : "mentor",
              })
            );
          },
          toggleTheme: () => setDarkMode(!darkMode),
          logout: () => console.log("logout"),
          selectChat: (id: string | undefined) => {
            console.log("open chat:", id);
            setMobileOpen(false);
          },
        })}
      </motion.div>

      <motion.div
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`hidden h-full ${
          collapsed ? "md:hidden" : "md:flex min-w-64"
        } bg-white dark:bg-black border-r border-slate-200 dark:border-gray-800 flex-col`}
      >
        {renderSidebarContent({
          user,
          role: user?.role,
          collapsed,
          mentorChats,
          darkMode,
          toggleRole: () => {
            dispatch(
              setUser({
                ...user,
                role: user?.role === "mentor" ? "student" : "mentor",
              })
            );
          },
          toggleTheme: () => setDarkMode(!darkMode),
          logout: () => console.log("logout"),
          selectChat: (id: string | undefined) => console.log("open chat:", id),
        })}
      </motion.div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-14 w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border dark:border-gray-700 shadow"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function renderSidebarContent({
  user,
  role,
  collapsed,
  mentorChats,
  toggleRole,
  logout,
  selectChat,
}: any) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return (
    <>
      {/* HEADER */}

      <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-gray-800">
        <Link href={`/`} className="flex items-center gap-1">
          <img
            src="/logo.png"
            alt="logo"
            className={`h-8 w-auto transition-all ${
              collapsed ? "scale-90 mx-auto" : ""
            }`}
          />
          {!collapsed && (
            <p className="text-xl text-black dark:text-white font-semibold font-serif italic tracking-tighter">
              PivotLab
            </p>
          )}
        </Link>
      </div>

      {/* ROLE SWITCH */}
      <div className="p-4">
        <button
          onClick={toggleRole}
          className={`flex items-center text-sm justify-between w-full cursor-pointer py-2 px-3 mb-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200/25 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span>Switch to {role === "mentor" ? "Learner" : "Mentor"}</span>
          {role === "mentor" ? (
            <FaUserGraduate className="w-4 h-4 text-orange-500" />
          ) : (
            <FaUserTie className="w-4 h-4 text-orange-500" />
          )}
        </button>

        {/* Theme */}
        <button
          className="flex w-full text-xs items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-200/25 cursor-pointer select-none"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <span className="text-sm dark:text-white">Theme</span>
          {theme === "light" ? (
            <Sun className="w-4 h-4 text-black" />
          ) : (
            <Moon className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* MENTOR CHAT LIST */}
      {role === "mentor" && mentorChats.length > 0 && (
        <div className="px-3 mt-2 flex-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs uppercase opacity-60 mb-2">Your Mentees</p>
          )}

          <div className="space-y-2">
            {mentorChats.map((chat: any) => (
              <button
                key={chat.id}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                onClick={() => selectChat(chat.id)}
              >
                <img
                  src={chat.avatar}
                  className="w-10 h-10 rounded-full mx-auto"
                />
                {!collapsed && (
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">{chat.name}</span>
                    <span className="text-xs opacity-60 truncate max-w-[140px]">
                      {chat.lastMessage}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto p-4 border-t border-slate-100 dark:border-gray-800">
        

        <div className="relative" ref={ref}>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-20 mt-2 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md overflow-hidden z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    console.log("Profile clicked");
                    setOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    console.log("Settings clicked");
                    setOpen(false);
                  }}
                >
                  Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    console.log("Help clicked");
                    setOpen(false);
                  }}
                >
                  Help
                </button>
                <button
                  className="w-full text-left flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 "
                  onClick={() => {
                    console.log("Logout clicked");
                    setOpen(false);
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setOpen(!open)}
          >
            <Avatar name={user?.name} src={user?.image || ""} size={40} />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user?.name}</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Sidebar;
