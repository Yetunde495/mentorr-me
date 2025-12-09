import PrivateRoute from "./components/privateRoute";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1 h-full relative overflow-hidden">
          {children}
        </main>
      </div>
    </PrivateRoute>
  );
}
