import { getCategoriesWithCounts } from "@/lib/mockApi";
import { CategoryManagerClient } from "@/components/CategoryManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();
  return <CategoryManagerClient initialCategories={categories} />;
}
