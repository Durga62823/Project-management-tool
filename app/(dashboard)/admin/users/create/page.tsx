import { redirect } from "next/navigation";
import { Shield, UserPlus } from "lucide-react";

import { auth } from "@/lib/auth";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export default async function CreateUserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header with gradient badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Admin - Add New User
            </h2>
            <p className="text-muted-foreground mt-1">
              Create a new user account for your organization
            </p>
          </div>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg p-6">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
