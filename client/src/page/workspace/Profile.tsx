import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, KeyRound, Loader2, Mail, Save, UserCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthContext } from "@/context/auth-provider";
import {
  changeCurrentUserPasswordMutationFn,
  updateCurrentUserProfileMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().trim().optional(),
    newPassword: z.string().trim().min(4, "Password must be at least 4 characters."),
    confirmPassword: z.string().trim().min(4, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password must match.",
    path: ["confirmPassword"],
  });

const Profile = () => {
  const queryClient = useQueryClient();
  const { user, refetchAuth } = useAuthContext();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name || "",
      email: user.email || "",
    });
  }, [profileForm, user]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const profileMutation = useMutation({
    mutationFn: updateCurrentUserProfileMutationFn,
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await refetchAuth();
      toast({
        title: "Profile updated",
        description: response.message,
        variant: "success",
      });
      setSelectedImage(null);
    },
    onError: (error: Error) => {
      toast({
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changeCurrentUserPasswordMutationFn,
    onSuccess: (response) => {
      toast({
        title: "Password updated",
        description: response.message,
        variant: "success",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const initials = useMemo(() => {
    return (
      user?.name
        ?.split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  }, [user?.name]);

  const handleProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);

    if (selectedImage) {
      formData.append("profilePicture", selectedImage);
    }

    profileMutation.mutate({ data: formData });
  };

  const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    passwordMutation.mutate(values);
  };

  return (
    <main className="space-y-4 py-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500">
          Update your personal details, profile image, and password.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-2 border-blue-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle2 className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Keep your profile details current across your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 rounded-2xl border border-slate-200">
                <AvatarImage src={previewUrl || user?.profilePicture || ""} alt={user?.name} />
                <AvatarFallback className="rounded-2xl bg-slate-100 text-lg font-semibold text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:shadow-sm">
                  <Camera className="h-4 w-4" />
                  Upload profile image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setSelectedImage(event.target.files?.[0] || null)
                    }
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Images are uploaded securely using Cloudinary.
                </p>
              </div>
            </div>

            <Form {...profileForm}>
              <form className="space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input className="h-10 rounded-xl border-slate-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input className="h-10 rounded-xl border-slate-200 pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="h-10 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700"
                >
                  {profileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save profile changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-violet-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-violet-600" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form className="space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-10 rounded-xl border-slate-200"
                          placeholder="Enter your current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-10 rounded-xl border-slate-200"
                          placeholder="Enter a new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="h-10 rounded-xl border-slate-200"
                          placeholder="Confirm your new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="h-10 rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-700"
                >
                  {passwordMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  Update password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
