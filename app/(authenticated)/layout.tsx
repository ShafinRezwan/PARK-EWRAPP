import { redirect } from "next/navigation";

import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
        }}
      />

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
