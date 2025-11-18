"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>

    
    </div>
  );
};

export default AppLayout;
