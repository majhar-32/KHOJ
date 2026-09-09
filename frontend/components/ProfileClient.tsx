"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  updateProfile,
  uploadProfilePicture,
  changePassword,
  getProfileStats,
  ProfileStats,
} from "@/lib/profileApi";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Building2,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bookmark,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";

export function ProfileClient() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();

  // Profile fields state
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [institution, setInstitution] = useState("");
  const [address, setAddress] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stats state
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Status & Feedback state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // Redirect if logged out
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Sync user data to form
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setInstitution(user.institution || "");
      setAddress(user.address || "");
      if (user.dateOfBirth) {
        const d = new Date(user.dateOfBirth);
        setDateOfBirth(d.toISOString().slice(0, 10));
      } else {
        setDateOfBirth("");
      }
    }
  }, [user]);

  // Fetch stats
  useEffect(() => {
    if (token && isAuthenticated) {
      setStatsLoading(true);
      getProfileStats(token)
        .then((data) => setStats(data))
        .catch((err) => console.error("Failed to load profile stats:", err))
        .finally(() => setStatsLoading(false));
    }
  }, [token, isAuthenticated]);

  // Initial letter fallback avatar
  const getInitials = (userName?: string) => {
    if (!userName) return "U";
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Handle Profile Picture File Change
  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      setToast("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast("Image size must be less than 5MB.");
      return;
    }

    setIsUploadingPicture(true);
    try {
      const res = await uploadProfilePicture(file, token);
      updateUser(res.user);
      setToast("Profile picture updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload picture";
      setToast(msg);
    } finally {
      setIsUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle Profile Details Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await updateProfile(
        {
          name: name.trim(),
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          institution: institution.trim() || null,
          address: address.trim() || null,
        },
        token
      );

      updateUser(res.user);
      setProfileSuccess("Profile updated successfully!");
      setToast("Profile updated!");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword }, token);
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast("Password changed successfully!");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="text-sm text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const roleBadge = () => {
    switch (user.role) {
      case "ORGANIZER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30">
            <Building2 className="w-3.5 h-3.5" />
            Organizer
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
            <User className="w-3.5 h-3.5" />
            Student / Participant
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-page py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* PROFILE HEADER CARD */}
        <Card className="p-6 sm:p-8 shadow-sm overflow-hidden relative border-border-default bg-bg-surface">
          {/* Subtle Top Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-accent via-indigo-500 to-amber-500" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            {/* Avatar & Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-bg-surface-secondary shadow-md bg-bg-surface-secondary flex items-center justify-center relative">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent via-blue-600 to-indigo-600 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center select-none">
                    {getInitials(user.name)}
                  </div>
                )}

                {/* Uploading Overlay */}
                {isUploadingPicture && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs gap-1.5 backdrop-blur-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPicture}
                title="Change Profile Picture"
                aria-label="Upload profile picture"
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handlePictureChange}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {user.name}
                </h1>
                <div className="inline-flex justify-center sm:justify-start">
                  {roleBadge()}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span>{user.email}</span>
                </div>
                {user.institution && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-text-muted" />
                    <span>{user.institution}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-text-muted pt-1">
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </Card>

        {/* ROLE-CONDITIONAL STATS SECTION */}
        <section aria-labelledby="stats-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="stats-heading" className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              {user.role === "ORGANIZER" ? "Organizer Performance Overview" : "Your Activity & Milestones"}
            </h2>
            {user.role !== "ORGANIZER" && (
              <Link href="/saved" className="text-xs font-semibold text-accent hover:underline">
                View All Saved Events →
              </Link>
            )}
          </div>

          {user.role === "ORGANIZER" ? (
            // Organizer Stats (4 cards)
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-bg-surface border border-warning/30 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-warning/60 transition-all group">
                <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-warning/15 text-warning border border-warning/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {statsLoading ? "..." : (stats && "totalEvents" in stats ? stats.totalEvents : 0)}
                </p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">Total Submitted</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-surface border border-success/30 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-success/60 transition-all group">
                <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-success/15 text-success border border-success/30 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {statsLoading ? "..." : (stats && "approvedEvents" in stats ? stats.approvedEvents : 0)}
                </p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">Approved</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-surface border border-amber-500/30 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-amber-500/60 transition-all group">
                <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {statsLoading ? "..." : (stats && "pendingEvents" in stats ? stats.pendingEvents : 0)}
                </p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">Pending Review</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-surface border border-danger/30 backdrop-blur text-center shadow-xs hover:shadow-md hover:border-danger/60 transition-all group">
                <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-danger/15 text-danger border border-danger/30 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {statsLoading ? "..." : (stats && "rejectedEvents" in stats ? stats.rejectedEvents : 0)}
                </p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">Rejected</p>
              </div>
            </div>
          ) : (
            // User / Admin Stats (2 cards)
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-bg-surface border border-accent/30 backdrop-blur flex items-center gap-4 shadow-xs hover:shadow-md hover:border-accent/60 transition-all group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent border border-accent/30 group-hover:scale-105 transition-transform shrink-0">
                  <Bookmark className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {statsLoading ? "..." : (stats && "savedEventsCount" in stats ? stats.savedEventsCount : 0)}
                  </p>
                  <p className="text-sm font-medium text-text-secondary">Events Saved / Bookmarked</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-surface border border-success/30 backdrop-blur flex items-center gap-4 shadow-xs hover:shadow-md hover:border-success/60 transition-all group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success/15 text-success border border-success/30 group-hover:scale-105 transition-transform shrink-0">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {statsLoading ? "..." : (stats && "registeredEventsCount" in stats ? stats.registeredEventsCount : 0)}
                  </p>
                  <p className="text-sm font-medium text-text-secondary">Events Confirmed Registered</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* EDITABLE PROFILE FIELDS CARD */}
        <Card className="p-6 sm:p-8 shadow-sm border-border-default bg-bg-surface">
          <div className="flex items-center gap-3 mb-6 border-b border-border-default pb-4">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Personal Information</h2>
              <p className="text-xs text-text-secondary">Update your profile details and background</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-6 rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-success flex items-center gap-2">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-6 rounded-lg border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <Input
                id="name"
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Email (Locked / Read-only) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-text-primary flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                  aria-label="Email address (cannot be changed)"
                  className="w-full rounded-lg border border-border-default bg-bg-surface-secondary px-3 h-10 text-sm text-text-muted cursor-not-allowed select-none"
                />
                <p className="text-xs text-text-muted">
                  Email is your primary login identifier and cannot be changed.
                </p>
              </div>

              {/* Date of Birth */}
              <Input
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />

              {/* Institution / University */}
              <Input
                id="institution"
                label="Institution / University"
                placeholder="e.g. Chittagong University of Engineering and Technology"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />

              {/* Address */}
              <div className="md:col-span-2">
                <Input
                  id="address"
                  label="Address / Location"
                  placeholder="e.g. Raozan, Chattogram, Bangladesh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* CHANGE PASSWORD CARD */}
        <Card className="p-6 sm:p-8 shadow-sm border-border-default bg-bg-surface">
          <div className="flex items-center gap-3 mb-6 border-b border-border-default pb-4">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Security & Password</h2>
              <p className="text-xs text-text-secondary">Change your password to keep your account safe</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-6 rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-success flex items-center gap-2">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-6 rounded-lg border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="max-w-md">
                <Input
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* ACCOUNT LOGOUT */}
        <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-default">
          <p className="text-xs text-text-muted text-center sm:text-left">
            Ready to end your session? You can always log back in at any time.
          </p>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="border-danger/40 text-danger hover:bg-danger/15 shrink-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out of Khoj
          </Button>
        </div>

      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
