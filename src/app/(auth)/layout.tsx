import ClientAuthRoute from "./components/client-auth-layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthRoute>
      <section className="">{children}</section>
    </ClientAuthRoute>
  );
}