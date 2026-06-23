export type SecondaryItem = { to: string; label: string; hash?: string };
export type SecondaryNav = {
  title: string;
  description?: string;
  groups: { title?: string; items: SecondaryItem[] }[];
};

// Match by route prefix. Order matters — most specific first.
export const SECONDARY_NAV: { match: (path: string) => boolean; nav: SecondaryNav }[] = [
  {
    match: (p) => p === "/",
    nav: {
      title: "Dashboard",
      description: "Operations overview",
      groups: [
        {
          items: [
            { to: "/", label: "Overview" },
            { to: "/analytics", label: "Analytics" },
            { to: "/system", label: "System status" },
            { to: "/audit", label: "Recent activity" },
          ],
        },
      ],
    },
  },
  {
    match: (p) => p.startsWith("/analytics"),
    nav: {
      title: "Analytics",
      description: "Growth & engagement",
      groups: [
        { title: "Reports", items: [
          { to: "/analytics", label: "Acquisition" },
          { to: "/analytics#conversion", label: "Conversion funnel" },
          { to: "/analytics#retention", label: "Retention" },
          { to: "/analytics#cohorts", label: "Cohorts" },
          { to: "/analytics#search", label: "Top searches" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/users"),
    nav: {
      title: "Users",
      description: "Customer directory",
      groups: [
        { title: "Segments", items: [
          { to: "/users", label: "All users" },
          { to: "/users?status=active", label: "Active" },
          { to: "/users?status=invited", label: "Invited" },
          { to: "/users?status=suspended", label: "Suspended" },
          { to: "/users?plan=Lifetime", label: "Lifetime customers" },
        ]},
        { title: "Operations", items: [
          { to: "/devices", label: "Devices" },
          { to: "/support", label: "Support tickets" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/subscriptions"),
    nav: {
      title: "Billing",
      description: "Plans & revenue",
      groups: [
        { items: [
          { to: "/subscriptions", label: "Subscribers" },
          { to: "/subscriptions#plans", label: "Plans & pricing" },
          { to: "/subscriptions#invoices", label: "Invoices" },
          { to: "/subscriptions#coupons", label: "Coupons" },
          { to: "/subscriptions#churn", label: "Churn analysis" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/devices"),
    nav: {
      title: "Devices",
      description: "Sessions & installations",
      groups: [
        { items: [
          { to: "/devices", label: "All devices" },
          { to: "/devices?type=Browser+Extension", label: "Browser extension" },
          { to: "/devices?type=Android", label: "Android app" },
          { to: "/devices?type=Web", label: "Web sessions" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/support"),
    nav: {
      title: "Support",
      description: "Customer requests",
      groups: [
        { title: "Inbox", items: [
          { to: "/support", label: "All tickets" },
          { to: "/support?status=open", label: "Open" },
          { to: "/support?status=in_progress", label: "In progress" },
          { to: "/support?status=resolved", label: "Resolved" },
        ]},
        { title: "By type", items: [
          { to: "/support?type=Bug", label: "Bugs" },
          { to: "/support?type=Feature+Request", label: "Feature requests" },
          { to: "/support?type=Billing", label: "Billing" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/security"),
    nav: {
      title: "Security",
      description: "Threats & hygiene",
      groups: [
        { items: [
          { to: "/security", label: "Overview" },
          { to: "/security#threats", label: "Active threats" },
          { to: "/security#breaches", label: "Breach monitor" },
          { to: "/security#policies", label: "Security policies" },
          { to: "/security#mfa", label: "MFA adoption" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/audit"),
    nav: {
      title: "Audit",
      description: "Administrative activity",
      groups: [
        { items: [
          { to: "/audit", label: "All events" },
          { to: "/audit?category=auth", label: "Authentication" },
          { to: "/audit?category=admin", label: "Admin actions" },
          { to: "/audit?category=data", label: "Data changes" },
          { to: "/audit?category=billing", label: "Billing" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/rbac"),
    nav: {
      title: "RBAC",
      description: "Roles & permissions",
      groups: [
        { items: [
          { to: "/rbac", label: "Roles" },
          { to: "/rbac#permissions", label: "Permissions matrix" },
          { to: "/rbac#api-keys", label: "API keys" },
          { to: "/rbac#assignments", label: "Assignments" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/content"),
    nav: {
      title: "Blog",
      description: "Content management",
      groups: [
        { items: [
          { to: "/content", label: "All posts" },
          { to: "/content?status=published", label: "Published" },
          { to: "/content?status=draft", label: "Drafts" },
          { to: "/content?status=scheduled", label: "Scheduled" },
          { to: "/content#categories", label: "Categories" },
          { to: "/content#authors", label: "Authors" },
          { to: "/content#media", label: "Media library" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/docs"),
    nav: {
      title: "Documentation",
      description: "Knowledge base",
      groups: [
        { items: [
          { to: "/docs", label: "All docs" },
          { to: "/docs?section=Guides", label: "Guides" },
          { to: "/docs?section=API", label: "API reference" },
          { to: "/docs?section=Architecture", label: "Architecture" },
          { to: "/docs?section=Enterprise", label: "Enterprise" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/changelog"),
    nav: {
      title: "Changelog",
      description: "Release notes",
      groups: [
        { title: "Releases", items: [
          { to: "/changelog", label: "All releases" },
          { to: "/changelog?status=published", label: "Published" },
          { to: "/changelog?status=draft", label: "Drafts" },
          { to: "/changelog?status=scheduled", label: "Scheduled" },
        ]},
        { title: "By category", items: [
          { to: "/changelog?category=feature", label: "Features" },
          { to: "/changelog?category=improvement", label: "Improvements" },
          { to: "/changelog?category=security", label: "Security" },
          { to: "/changelog?category=bugfix", label: "Bug fixes" },
          { to: "/changelog?category=performance", label: "Performance" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/announcements"),
    nav: {
      title: "Announcements",
      description: "In-product & email",
      groups: [
        { items: [
          { to: "/announcements", label: "All announcements" },
          { to: "/announcements?type=Maintenance", label: "Maintenance" },
          { to: "/announcements?type=Feature", label: "Features" },
          { to: "/announcements?type=Notice", label: "Notices" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/system"),
    nav: {
      title: "System",
      description: "Operations center",
      groups: [
        { title: "Overview", items: [
          { to: "/system", label: "Operations center" },
          { to: "/system#services", label: "Services" },
          { to: "/system#incidents", label: "Active incidents" },
          { to: "/system#maintenance", label: "Maintenance" },
        ]},
      ],
    },
  },
  {
    match: (p) => p.startsWith("/settings"),
    nav: {
      title: "Settings",
      description: "Configuration",
      groups: [
        { title: "Workspace", items: [
          { to: "/settings", label: "Company profile" },
          { to: "/settings#branding", label: "Branding" },
          { to: "/settings#email", label: "Email templates" },
          { to: "/settings#notifications", label: "Notifications" },
        ]},
        { title: "Platform", items: [
          { to: "/settings#plans", label: "Plans & pricing" },
          { to: "/settings#flags", label: "Feature flags" },
          { to: "/settings#api-keys", label: "API keys" },
          { to: "/settings#integrations", label: "Integrations" },
          { to: "/settings#policies", label: "Security policies" },
        ]},
      ],
    },
  },
];

export function getSecondaryNav(pathname: string): SecondaryNav | null {
  return SECONDARY_NAV.find((s) => s.match(pathname))?.nav ?? null;
}
