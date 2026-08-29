"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Lock, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed successfully! (Simulated)");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Account Settings</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage your profile and account preferences.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-200 pb-4">
            <User className="w-5 h-5 text-neutral-500" aria-hidden="true" />
            <h2 className="text-xl font-bold text-neutral-900">Personal Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              value={user?.email || "Not signed in"}
              disabled
              readOnly
            />
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-200 pb-4">
            <Lock className="w-5 h-5 text-neutral-500" aria-hidden="true" />
            <h2 className="text-xl font-bold text-neutral-900">Change Password</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary">Update Password</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 sm:p-8 border-error-200 bg-error-50/30">
          <div className="flex items-center gap-3 mb-6 border-b border-error-200 pb-4">
            <LogOut className="w-5 h-5 text-error-600" aria-hidden="true" />
            <h2 className="text-xl font-bold text-error-800">Log Out</h2>
          </div>
          <p className="text-sm text-neutral-700 mb-6">
            You will be signed out of your account on this device.
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            Log Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
