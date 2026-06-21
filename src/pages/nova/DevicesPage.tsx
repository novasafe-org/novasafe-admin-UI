import { Card, PageHeader, StatusDot } from "@/components/nova/ui";
import { DataTable, Column } from "@/components/nova/DataTable";
import { devices } from "@/lib/mockData";

type Device = (typeof devices)[number];

const columns: Column<Device>[] = [
  {
    key: "type",
    header: "Device",
    accessor: (d) => `${d.type} ${d.id}`,
    sortable: true,
    render: (d) => (<div><div className="text-foreground font-medium">{d.type}</div><div className="text-xs text-muted-foreground font-mono">{d.id}</div></div>),
  },
  { key: "user", header: "User", accessor: (d) => d.user, sortable: true, filterable: true },
  {
    key: "_type",
    header: "Type",
    accessor: (d) => d.type,
    sortable: true,
    filterable: true,
    filterOptions: [
      { label: "Browser Extension", value: "Browser Extension" },
      { label: "Android", value: "Android" },
      { label: "Web", value: "Web" },
    ],
    render: (d) => <span className="text-muted-foreground">{d.type}</span>,
  },
  { key: "os", header: "OS", accessor: (d) => d.os, sortable: true, filterable: true },
  { key: "browser", header: "Browser", accessor: (d) => d.browser, sortable: true },
  { key: "version", header: "Version", accessor: (d) => d.version, render: (d) => <span className="font-mono text-xs text-muted-foreground">{d.version}</span> },
  { key: "country", header: "Country", accessor: (d) => d.country, sortable: true, filterable: true },
  {
    key: "status",
    header: "Status",
    accessor: (d) => d.status,
    sortable: true,
    filterable: true,
    filterOptions: [{ label: "Online", value: "online" }, { label: "Offline", value: "offline" }],
    render: (d) => <div className="flex items-center gap-2"><StatusDot status={d.status as any} /><span className="text-xs capitalize text-muted-foreground">{d.status}</span></div>,
  },
  {
    key: "lastActive",
    header: "Last active",
    accessor: (d) => new Date(d.lastActive).getTime(),
    sortable: true,
    render: (d) => <span className="text-xs text-muted-foreground">{new Date(d.lastActive).toLocaleString()}</span>,
  },
];

export default function DevicesPage() {
  const ext = devices.filter((d) => d.type === "Browser Extension").length;
  const and = devices.filter((d) => d.type === "Android").length;
  const web = devices.filter((d) => d.type === "Web").length;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader eyebrow="Customers" title="Devices" description="All sessions and connected installations across platforms." />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Browser extensions</div><div className="text-2xl font-semibold mt-1 tabular-nums">{ext}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Android devices</div><div className="text-2xl font-semibold mt-1 tabular-nums">{and}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Web sessions</div><div className="text-2xl font-semibold mt-1 tabular-nums">{web}</div></Card>
      </div>

      <DataTable
        columns={columns}
        rows={devices}
        rowKey={(d) => d.id}
        searchPlaceholder="Search user, OS, browser…"
      />
    </div>
  );
}
