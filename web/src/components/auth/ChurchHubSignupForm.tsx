"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { generateUsername, validateEmail, validatePassword } from "@/lib/utils";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  churchName: z.string().min(2, "Church name must be at least 2 characters"),
  bio: z.string().optional(),
  schedulingUsername: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function ChurchHubSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      clearError();

      // Generate username if not provided
      const schedulingUsername = data.schedulingUsername || generateUsername(data.email);

      await signup({
        email: data.email,
        name: data.name,
        password: data.password,
        churchName: data.churchName,
        bio: data.bio,
        schedulingUsername,
      });

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join ChurchHub</CardTitle>
          <CardDescription>
            Create your account to start scheduling pastoral meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-danger bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="pastor@church.com"
                {...register("email")}
                className={errors.email ? "border-danger" : ""}
              />
              {errors.email && (
                <p className="text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Pastor John Smith"
                {...register("name")}
                className={errors.name ? "border-danger" : ""}
              />
              {errors.name && (
                <p className="text-sm text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="churchName">Church Name *</Label>
              <Input
                id="churchName"
                type="text"
                placeholder="First Baptist Church"
                {...register("churchName")}
                className={errors.churchName ? "border-danger" : ""}
              />
              {errors.churchName && (
                <p className="text-sm text-danger">{errors.churchName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                {...register("password")}
                className={errors.password ? "border-danger" : ""}
              />
              {errors.password && (
                <p className="text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-danger" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedulingUsername">Scheduling Username</Label>
              <Input
                id="schedulingUsername"
                type="text"
                placeholder={email ? generateUsername(email) : "your-username"}
                {...register("schedulingUsername")}
              />
              <p className="text-xs text-fg-muted">
                This will be your public booking link: churchhub.com/book/your-username
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Tell us about your ministry..."
                {...register("bio")}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-fg-muted">
              Already have an account?{" "}
              <a href="/auth/login" className="text-accent hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
