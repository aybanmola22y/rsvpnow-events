"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getSearchText,
  rowKey,
  toolbar,
  pageSize = 8,
  searchPlaceholder = "Search",
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  rows: T[];
  columns: Column<T>[];
  getSearchText: (row: T) => string;
  rowKey: (row: T) => string;
  toolbar?: React.ReactNode;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let next = rows.filter((row) => !needle || getSearchText(row).toLowerCase().includes(needle));
    const column = columns.find((item) => item.key === sortKey);
    if (column?.sortValue) {
      const sortValue = column.sortValue;
      next = [...next].sort((a, b) => {
        const left = sortValue(a);
        const right = sortValue(b);
        const compared =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right));
        return direction === "asc" ? compared : -compared;
      });
    }
    return next;
  }, [rows, query, sortKey, direction, columns, getSearchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function toggleSort(key: string) {
    const column = columns.find((item) => item.key === key);
    if (!column?.sortValue) return;
    if (sortKey === key) {
      setDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("asc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="h-11 w-full border-stone-300 bg-white shadow-none lg:max-w-sm"
          aria-label={searchPlaceholder}
        />
        {toolbar ? <div className="flex flex-wrap gap-2">{toolbar}</div> : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState className="rounded-none border-solid border-stone-200" title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-black/5 bg-white shadow-sm md:block">
            <table className="w-full text-sm [&_tbody_td:first-child]:font-medium">
              <thead className="border-b border-stone-200 bg-[#faf7f2] text-left text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={`px-4 py-3 font-medium ${column.header === "Actions" ? "text-right" : ""}`}>
                      {column.sortValue ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() => toggleSort(column.key)}
                        >
                          {column.header}
                          {sortKey === column.key ? (direction === "asc" ? "↑" : "↓") : ""}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-stone-100 last:border-0 hover:bg-[#faf7f2]">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-3.5 align-middle ${column.header === "Actions" ? "text-right" : ""} ${column.className ?? ""}`}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {visible.map((row) => (
              <article key={rowKey(row)} className="space-y-2 border border-stone-200 bg-white p-4">
                {columns.map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{column.header}</span>
                    <div className="text-right">{column.cell(row)}</div>
                  </div>
                ))}
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <span>
                {currentPage} / {pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={currentPage >= pages}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
