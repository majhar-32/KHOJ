import { getUsers } from "@/lib/mockApi";
import { UserManagerClient } from "@/components/UserManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getUsers();
  return <UserManagerClient initialUsers={users} />;
}
