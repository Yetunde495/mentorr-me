import AppLayout from "@/components/layout/app-layout";
import PrivateRoute from "./components/privateRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  );
}
