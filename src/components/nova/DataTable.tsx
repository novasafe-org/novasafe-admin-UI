import { ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, Input, Select } from "./ui";

export type Column<T> = {
  key: string;
  header: string;
  accessor?: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  align?: "left" | "right" | "center";
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  initialPageSize?: number;
  emptyMessage?: string;
  toolbarExtra?: ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchPlaceholder = "Search…",
  initialPageSize = 10,
  emptyMessage = "No results match your filters.",
  toolbarExtra,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const hay = columns
          .map((c) => (c.accessor ? c.accessor(r) : (r as any)[c.key]))
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      for (const c of columns) {
        const f = filters[c.key];
        if (!f) continue;
        const v = String(c.accessor ? c.accessor(r) : (r as any)[c.key] ?? "").toLowerCase();
        if (!v.includes(f.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, search, filters, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const acc = (r: T) => (col.accessor ? col.accessor(r) : (r as any)[col.key]);
    return [...filtered].sort((a, b) => {
      const av = acc(a), bv = acc(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const na = typeof av === "number" ? av : String(av).toLowerCase();
      const nb = typeof bv === "number" ? bv : String(bv).toLowerCase();
      if (na < nb) return sort.dir === "asc" ? -1 : 1;
      if (na > nb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, columns]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const toggleSort = (key: string) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const hasFilters = Object.values(filters).some(Boolean) || search;
  const filterableCols = columns.filter((c) => c.filterable);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="pl-8 w-72"
          />
        </div>

        {filterableCols.map((c) =>
          c.filterOptions ? (
            <Select
              key={c.key}
              value={filters[c.key] ?? ""}
              onChange={(e) => { setFilters((f) => ({ ...f, [c.key]: e.target.value })); setPage(1); }}
            >
              <option value="">All {c.header.toLowerCase()}</option>
              {c.filterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          ) : (
            <Input
              key={c.key}
              value={filters[c.key] ?? ""}
              onChange={(e) => { setFilters((f) => ({ ...f, [c.key]: e.target.value })); setPage(1); }}
              placeholder={`${c.header}…`}
              className="w-40"
            />
          )
        )}

        {hasFilters && (
          <button
            onClick={() => { setFilters({}); setSearch(""); setPage(1); }}
            className="h-9 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {toolbarExtra}
          <span className="tabular-nums">{total === 0 ? "0" : `${start}–${end}`} of {total}</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                {columns.map((c) => {
                  const align = c.align ?? "left";
                  const sortIcon = !c.sortable
                    ? null
                    : sort?.key === c.key
                      ? sort.dir === "asc"
                        ? <ArrowUp className="w-3 h-3" />
                        : <ArrowDown className="w-3 h-3" />
                      : <ArrowUpDown className="w-3 h-3 opacity-40" />;
                  return (
                    <th
                      key={c.key}
                      className={cn(
                        "px-4 py-2.5 font-semibold select-none",
                        align === "right" && "text-right",
                        align === "center" && "text-center",
                        align === "left" && "text-left",
                        c.sortable && "cursor-pointer hover:text-foreground",
                      )}
                      onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                    >
                      <span className={cn("inline-flex items-center gap-1.5", align === "right" && "justify-end w-full", align === "center" && "justify-center w-full")}>
                        {c.header}{sortIcon}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {pageRows.map((row) => (
                <tr key={rowKey(row)} className="border-t border-border hover:bg-accent/40">
                  {columns.map((c) => {
                    const align = c.align ?? "left";
                    return (
                      <td
                        key={c.key}
                        className={cn(
                          "px-4 py-2.5 align-middle",
                          align === "right" && "text-right tabular-nums",
                          align === "center" && "text-center",
                          c.className,
                        )}
                      >
                        {c.render ? c.render(row) : (c.accessor ? c.accessor(row) : (row as any)[c.key]) as ReactNode}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 text-xs"
            >
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 tabular-nums">Page {safePage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="h-8 w-8 rounded-md border border-input bg-card flex items-center justify-center hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            ><ChevronLeft className="w-4 h-4" /></button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="h-8 w-8 rounded-md border border-input bg-card flex items-center justify-center hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}
