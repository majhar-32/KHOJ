"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Tag, ArrowRight } from "lucide-react";

export function HomeCategoriesRow({ categories }: { categories: string[] }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCategoryClick = (categoryName?: string) => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (categoryName) {
      router.push(`/events?category=${encodeURIComponent(categoryName)}`);
    } else {
      router.push("/events");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Browse by Category
        </h2>
        <button
          onClick={() => handleCategoryClick()}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 cursor-pointer"
        >
          All Events <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 snap-x">
        <button
          onClick={() => handleCategoryClick()}
          className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
        >
          <span>All Categories</span>
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
            <span>{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
