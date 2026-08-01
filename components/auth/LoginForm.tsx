"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { loginUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = (values: SignInInput) => {
    startTransition(async () => {
      const result = await loginUser(values);
      if (!result.success) {
        if (result.error === "Confirm your email before logging in") {
          router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        toast.error(result.error);
        return;
      }

      toast.success("Authenticated");

      // Update the session to ensure it's synced
      await update();

      // Get user role from result data or fetch from session
      const userRole = (result.data as any)?.role;
      let redirectPath = "/dashboard";

      // Role-based routing
      if (userRole === "ADMIN") {
        redirectPath = "/admin";
      } else if (userRole === "MANAGER") {
        redirectPath = "/manager";
      } else if (userRole === "LEAD") {
        redirectPath = "/lead";
      } else {
        redirectPath = "/dashboard";
      }

      setAuth({ status: "authenticated", user: { email: values.email } });
      
      // Use window.location for a full page navigation to ensure session is loaded
      window.location.href = redirectPath;
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-brand-primary"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="h-4 w-4"
          {...register("rememberMe")}
        />
        Remember me for 30 days
      </label>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
