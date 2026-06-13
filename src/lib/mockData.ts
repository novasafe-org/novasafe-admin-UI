// Deterministic mock data generator for NovaSafe admin
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seeded(42);

const firstNames = ["Avery", "Jordan", "Riley", "Casey", "Morgan", "Taylor", "Quinn", "Hayden", "Reese", "Sage", "Emery", "Parker", "Rowan", "Skyler", "Drew", "Phoenix", "Blake", "Cameron", "Devon", "Eliot"];
const lastNames = ["Chen", "Patel", "Okafor", "Nguyen", "Silva", "Müller", "Tanaka", "Rossi", "Kim", "Khan", "Singh", "Garcia", "Schmidt", "Andersen", "Mori", "Dubois", "Costa", "Hassan", "Larsen", "Ivanov"];
const countries = ["US", "DE", "UK", "JP", "BR", "FR", "IN", "CA", "AU", "NL", "SE", "ES"];
const plans = ["Free", "Pro Monthly", "Pro Yearly", "Lifetime"] as const;
const statuses = ["active", "suspended", "invited"] as const;

export type User = {
  id: string;
  name: string;
  email: string;
  plan: typeof plans[number];
  status: typeof statuses[number];
  country: string;
  devices: number;
  vaultItems: number;
  twoFA: boolean;
  securityScore: number;
  lastLogin: string;
  joined: string;
  storageMb: number;
};

export const users: User[] = Array.from({ length: 64 }).map((_, i) => {
  const fn = firstNames[Math.floor(rand() * firstNames.length)];
  const ln = lastNames[Math.floor(rand() * lastNames.length)];
  const daysAgo = Math.floor(rand() * 720);
  const lastDays = Math.floor(rand() * 30);
  return {
    id: `usr_${(1000 + i).toString(36)}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${["acme.io", "northwind.dev", "globex.com", "monolith.co", "hyperion.app"][i % 5]}`,
    plan: plans[Math.floor(rand() * plans.length)],
    status: statuses[i % 17 === 0 ? 1 : i % 23 === 0 ? 2 : 0],
    country: countries[Math.floor(rand() * countries.length)],
    devices: 1 + Math.floor(rand() * 5),
    vaultItems: 12 + Math.floor(rand() * 480),
    twoFA: rand() > 0.32,
    securityScore: 40 + Math.floor(rand() * 60),
    lastLogin: new Date(Date.now() - lastDays * 86400000).toISOString(),
    joined: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    storageMb: Math.floor(rand() * 800),
  };
});

export const devices = Array.from({ length: 48 }).map((_, i) => {
  const types = ["Browser Extension", "Android", "Web"];
  const oses = ["macOS 14", "Windows 11", "Ubuntu 22", "Android 14", "iOS 17"];
  const browsers = ["Chrome 128", "Firefox 130", "Safari 17", "Edge 128", "Brave 1.69"];
  const type = types[i % 3];
  return {
    id: `dev_${i.toString(36).padStart(4, "0")}`,
    user: users[i % users.length].email,
    type,
    os: oses[Math.floor(rand() * oses.length)],
    browser: type === "Android" ? "—" : browsers[Math.floor(rand() * browsers.length)],
    version: `${4 + (i % 3)}.${Math.floor(rand() * 20)}.${Math.floor(rand() * 9)}`,
    country: countries[Math.floor(rand() * countries.length)],
    lastActive: new Date(Date.now() - Math.floor(rand() * 14) * 86400000).toISOString(),
    status: rand() > 0.15 ? "online" : "offline",
  };
});

export const auditLogs = Array.from({ length: 80 }).map((_, i) => {
  const actions = [
    "user.created", "user.deleted", "user.suspended", "subscription.upgraded",
    "subscription.cancelled", "role.changed", "settings.updated", "content.published",
    "device.revoked", "api_key.rotated", "policy.updated", "billing.refunded",
  ];
  const actors = ["owner@novasafe.io", "admin@novasafe.io", "sec-bot@novasafe.io"];
  return {
    id: `log_${i.toString(36)}`,
    actor: actors[i % actors.length],
    action: actions[i % actions.length],
    target: users[i % users.length].email,
    ip: `${10 + (i % 240)}.${i % 255}.${(i * 7) % 255}.${(i * 13) % 255}`,
    timestamp: new Date(Date.now() - i * 3_600_000).toISOString(),
  };
});

export const tickets = Array.from({ length: 24 }).map((_, i) => ({
  id: `TKT-${1000 + i}`,
  subject: [
    "Cannot sync passwords across devices",
    "2FA recovery code request",
    "Billing question about Lifetime plan",
    "Browser extension not loading on Firefox",
    "Feature request: passkey support",
    "Vault import from 1Password failing",
    "Refund request for double charge",
    "Android app crashes on launch",
  ][i % 8],
  user: users[i % users.length].email,
  type: ["Bug", "Question", "Feature Request", "Billing"][i % 4],
  status: ["open", "in_progress", "resolved", "closed"][i % 4],
  priority: ["low", "normal", "high", "urgent"][i % 4],
  createdAt: new Date(Date.now() - i * 86400000 / 2).toISOString(),
}));

export const changelog = [
  { version: "4.18.0", date: "2026-06-10", type: "Feature", title: "Passkey support across all platforms", body: "NovaSafe now natively supports WebAuthn passkeys for storage and autofill." },
  { version: "4.17.2", date: "2026-05-28", type: "Security", title: "Patched session fixation vulnerability", body: "Resolved CVE-2026-1182 affecting browser extension auth flow." },
  { version: "4.17.0", date: "2026-05-15", type: "Feature", title: "Family vaults (beta)", body: "Share password groups across up to 6 family members with granular permissions." },
  { version: "4.16.4", date: "2026-04-30", type: "Bug Fix", title: "Fixed Android biometric prompt loop", body: "Resolved an issue where Android 14 devices entered a biometric loop after re-auth." },
  { version: "4.16.0", date: "2026-04-12", type: "Feature", title: "Breach monitor expanded to 14B records", body: "Added 4B new credentials from recent breaches to the dark web monitor." },
];

export const announcements = [
  { id: "ann_1", type: "Maintenance", title: "Scheduled maintenance — June 20, 02:00 UTC", date: "2026-06-12", audience: "All users" },
  { id: "ann_2", type: "Feature", title: "Passkeys are now generally available", date: "2026-06-10", audience: "Pro users" },
  { id: "ann_3", type: "Downtime", title: "EU region degraded performance — resolved", date: "2026-06-05", audience: "EU users" },
  { id: "ann_4", type: "Notice", title: "Updated privacy policy effective July 1", date: "2026-06-01", audience: "All users" },
];

export const blogPosts = [
  { id: "p1", title: "How NovaSafe encrypts your vault", author: "Avery Chen", category: "Security", status: "published", views: 12480, updated: "2026-06-08" },
  { id: "p2", title: "Migrating from 1Password in 5 minutes", author: "Jordan Patel", category: "Guides", status: "published", views: 8930, updated: "2026-06-04" },
  { id: "p3", title: "Why passkeys matter for everyone", author: "Riley Okafor", category: "Product", status: "draft", views: 0, updated: "2026-06-11" },
  { id: "p4", title: "Family sharing — best practices", author: "Casey Nguyen", category: "Guides", status: "scheduled", views: 0, updated: "2026-06-12" },
  { id: "p5", title: "State of the password 2026", author: "Morgan Silva", category: "Research", status: "published", views: 24102, updated: "2026-05-30" },
];

export const docs = [
  { id: "d1", title: "Getting started", section: "Guides", version: "v4", status: "published", updated: "2026-06-09" },
  { id: "d2", title: "Browser extension API", section: "API", version: "v4", status: "published", updated: "2026-06-07" },
  { id: "d3", title: "Vault encryption model", section: "Architecture", version: "v4", status: "published", updated: "2026-05-22" },
  { id: "d4", title: "SCIM provisioning", section: "Enterprise", version: "v4", status: "draft", updated: "2026-06-11" },
  { id: "d5", title: "Emergency access", section: "Guides", version: "v3", status: "published", updated: "2026-04-18" },
  { id: "d6", title: "REST API reference", section: "API", version: "v4", status: "published", updated: "2026-06-10" },
];

export const services = [
  { name: "REST API", region: "Global", status: "operational", latency: 84, uptime: 99.99 },
  { name: "Sync Service", region: "Global", status: "operational", latency: 112, uptime: 99.98 },
  { name: "Database (Primary)", region: "us-east-1", status: "operational", latency: 6, uptime: 99.999 },
  { name: "Database (Replica)", region: "eu-west-1", status: "operational", latency: 8, uptime: 99.99 },
  { name: "Queue Workers", region: "Global", status: "operational", latency: 41, uptime: 99.97 },
  { name: "Email Delivery", region: "Global", status: "degraded", latency: 920, uptime: 99.41 },
  { name: "Push Notifications", region: "Global", status: "operational", latency: 220, uptime: 99.95 },
  { name: "Object Storage", region: "Global", status: "operational", latency: 58, uptime: 99.99 },
];

// time series
export const userGrowth = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  users: 1200 + i * 28 + Math.floor(rand() * 60),
  active: 800 + i * 18 + Math.floor(rand() * 40),
}));
export const revenueSeries = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  mrr: 38000 + i * 2400 + Math.floor(rand() * 2000),
  new: 4200 + Math.floor(rand() * 1800),
  churn: 800 + Math.floor(rand() * 600),
}));
export const deviceMix = [
  { name: "Browser Ext.", value: 5420 },
  { name: "Android", value: 3180 },
  { name: "Web", value: 2940 },
];
export const securitySeries = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  failedLogins: 40 + Math.floor(rand() * 120),
  alerts: Math.floor(rand() * 14),
  breaches: Math.floor(rand() * 5),
}));
