"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { KhojUser } from "@/lib/types";
import { getUsers, suspendUser, reactivateUser, promoteUser, demoteUser } from "@/lib/usersApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Search, ShieldCheck, ShieldOff, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

type ModalActionType = "suspend" | "reactivate" | "promote" | "demote";

export function UserManagerClient({ initialUsers = [] }: { initialUsers?: KhojUser[] }) {
  const { token, user: currentUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<KhojUser[]>(initialUsers);
  const [loading, setLoading] = useState(!initialUsers.length);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "organizer" | "admin">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  
  const [modalState, setModalState] = useState<{
    user: KhojUser;
    action: ModalActionType;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getUsers(token);
      setUsers(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else if (!authLoading && !token) {
      setLoading(false);
    }
  }, [token, authLoading, fetchUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus = filterStatus === "all" || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const handleConfirmAction = async () => {
    if (!modalState) return;
    const { user, action } = modalState;
    setIsProcessing(true);
    setError(null);
    try {
      let updated: KhojUser | null = null;
      if (action === "suspend") {
        updated = await suspendUser(user.id, token);
      } else if (action === "reactivate") {
        updated = await reactivateUser(user.id, token);
      } else if (action === "promote") {
        updated = await promoteUser(user.id, token);
      } else if (action === "demote") {
        updated = await demoteUser(user.id, token);
      }

      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === updated!.id ? updated! : u)));
      }
      setModalState(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute action.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">User Management</h1>
        <p className="text-neutral-600">Search, filter, and manage platform users and administrator permissions.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <select
          aria-label="Filter by role"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
          className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          aria-label="Filter by status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Verified</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {loading ? (
                <>
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-lg font-medium text-neutral-900 mb-1">No users found</p>
                    <p className="text-sm text-neutral-500">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  const isAdmin = user.role === "admin";

                  return (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : user.role === "organizer"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}>
                          {isAdmin && <ShieldAlert className="w-3 h-3" />}
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 text-success-600 text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-neutral-400 text-xs">
                            <ShieldOff className="w-3.5 h-3.5" aria-hidden="true" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-success-50 text-success-700"
                            : "bg-error-50 text-error-700"
                        }`}>
                          {user.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-neutral-400 font-medium px-2.5 py-1 bg-neutral-100 rounded-md">
                            You (Admin)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Promote / Demote Button */}
                            {isAdmin ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-amber-700 hover:bg-amber-50"
                                onClick={() => setModalState({ user, action: "demote" })}
                                title="Demote to standard user"
                              >
                                <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                                Demote
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs text-purple-700 hover:bg-purple-50 hover:border-purple-200"
                                onClick={() => setModalState({ user, action: "promote" })}
                                title="Promote to administrator"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-purple-600" />
                                Promote
                              </Button>
                            )}

                            {/* Suspend / Reactivate Button */}
                            <Button
                              size="sm"
                              variant={user.status === "active" ? "destructive" : "secondary"}
                              onClick={() => setModalState({ user, action: user.status === "active" ? "suspend" : "reactivate" })}
                              aria-label={user.status === "active" ? `Suspend ${user.name}` : `Reactivate ${user.name}`}
                            >
                              {user.status === "active" ? "Suspend" : "Reactivate"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={
          modalState?.action === "promote"
            ? "Promote to Admin"
            : modalState?.action === "demote"
            ? "Demote to Standard User"
            : modalState?.action === "suspend"
            ? "Suspend User"
            : "Reactivate User"
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState(null)}>Cancel</Button>
            <Button
              variant={
                modalState?.action === "suspend" || modalState?.action === "demote"
                  ? "destructive"
                  : "primary"
              }
              onClick={handleConfirmAction}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : modalState?.action === "promote"
                ? "Confirm Promotion"
                : modalState?.action === "demote"
                ? "Confirm Demotion"
                : modalState?.action === "suspend"
                ? "Suspend User"
                : "Reactivate User"}
            </Button>
          </>
        }
      >
        <div className="text-sm text-neutral-600 space-y-2">
          {modalState?.action === "promote" && (
            <p>
              Are you sure you want to promote <strong>{modalState.user.name}</strong> ({modalState.user.email}) to an <strong>Admin</strong>? They will gain administrative privileges, including access to user management and review queues.
            </p>
          )}

          {modalState?.action === "demote" && (
            <p>
              Are you sure you want to demote <strong>{modalState.user.name}</strong> ({modalState.user.email}) back to a standard user? Their admin access will be revoked immediately.
            </p>
          )}

          {modalState?.action === "suspend" && (
            <p>
              Are you sure you want to suspend <strong>{modalState.user.name}</strong>? They will no longer be able to log in or submit events.
            </p>
          )}

          {modalState?.action === "reactivate" && (
            <p>
              Are you sure you want to reactivate <strong>{modalState.user.name}</strong>? They will regain full access to their account.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

