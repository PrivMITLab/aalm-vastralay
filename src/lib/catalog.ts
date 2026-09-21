import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { categories } from "@/db/schema";

/** Leaf categories with their parent name, for product forms. */
export async function loadCategoryOptions() {
  const parent = alias(categories, "parent");
  const rows = await db
    .select({ id: categories.id, name: categories.name, parentName: parent.name, sort: categories.sortOrder, parentSort: parent.sortOrder })
    .from(categories)
    .leftJoin(parent, eq(categories.parentId, parent.id))
    .where(eq(categories.isActive, true));
  return rows
    .filter((r) => r.parentName !== null)
    .sort((a, b) => (a.parentSort ?? 0) - (b.parentSort ?? 0) || a.sort - b.sort || a.name.localeCompare(b.name))
    .map(({ id, name, parentName }) => ({ id, name, parentName }));
}
