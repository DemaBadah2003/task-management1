export type PageItem = number | "ellipsis-start" | "ellipsis-end";

export const PAGE_SIZE = 10;
/**
 * القواعد:
 * - أول صفحة وآخر صفحة دائماً ظاهرين
 * - الصفحة المختارة + واحدة قبلها وواحدة بعدها
 * - لو المختارة 1  → نعرض 1 2 3
 * - لو المختارة آخر صفحة → نعرض آخر 3 صفحات
 * - الـ ellipsis فقط لو بتعوض عن صفحتين أو أكثر
 *   (لو ناقصة صفحة وحدة بنعرض رقمها بدل الـ ellipsis)
 * - لو عدد الصفحات <= 5 نعرضهم كلهم
 */
export function getPageItems(
  currentPage: number,
  totalPages: number,
  showAllThreshold = 5
): PageItem[] {
  if (totalPages <= showAllThreshold) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  if (currentPage === 1) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage === totalPages) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];

  sorted.forEach((page, index) => {
    const prev = sorted[index - 1];

    if (prev !== undefined) {
      const gap = page - prev - 1; // عدد الصفحات المخفية بينهم
      if (gap === 1) {
        items.push(prev + 1); // صفحة وحدة بس: بنعرضها
      } else if (gap >= 2) {
        items.push(prev === 1 ? "ellipsis-start" : "ellipsis-end");
      }
    }

    items.push(page);
  });

  return items;
}