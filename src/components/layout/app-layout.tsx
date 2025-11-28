"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import FormSidebar from "./form-sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Get user from redux
  const user = useSelector((state: any) => state.auth.user);
  const isMentor = user?.role === "mentor";

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden relative">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full relative overflow-hidden">
        {/* Right sidebar toggle (mobile only & mentors only) */}
        {isMentor && (
          <button
            onClick={() => setShowRightSidebar(true)}
            className="md:hidden absolute right-3 top-3 z-20 p-2 bg-black/10 dark:bg-white/10 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {children}
      </main>

      {/* RIGHT SIDEBAR (Mentor Only) */}
      {isMentor && (
        <>
          <div
            className={`
              fixed md:static top-0 right-0 h-full 
              w-[260px] md:w-[300px] bg-white dark:bg-gray-900 
              border-l border-gray-200 dark:border-gray-800 
              transition-transform duration-300 z-40
              ${
                showRightSidebar
                  ? "translate-x-0"
                  : "translate-x-full md:translate-x-0"
              }
            `}
          >
            <FormSidebar onClose={() => setShowRightSidebar(false)} />
          </div>

          {/* Mobile overlay */}
          {showRightSidebar && (
            <div
              onClick={() => setShowRightSidebar(false)}
              className="fixed inset-0 bg-black/50 md:hidden z-30"
            />
          )}
        </>
      )}
    </div>
  );
};

export default AppLayout;
