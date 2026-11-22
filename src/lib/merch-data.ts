export type LeadStatus =
  | "new"
  | "open"
  | "quotation_pending"
  | "payment_pending"
  | "production_running"
  | "dispatch_pending"
  | "completed"
  | "archived";

export type TimelineEvent = {
  id: string;
  label: string;
  actor: string;
  occurredAt: string;
};

export type PaymentRecord = {
  label: string;
  amount: string;
  status: "pending" | "paid";
  date?: string;
  reference?: string;
};

export type AssetLink = {
  label: string;
  type: string;
  href: string;
};

export type MockupAsset = {
  label: string;
  version: string;
  updatedAt: string;
  preview: string;
};

export type ProductionStep = {
  label: string;
  status: "done" | "active" | "upcoming";
};

export type QuoteVersion = {
  version: string;
  status: "sent" | "approved" | "changes_requested";
  sentAt: string;
};

export type MerchProject = {
  leadId: string;
  status: LeadStatus;
  priority: "new" | "active" | "watch";
  customerName: string;
  phone: string;
  organization: string;
  selectedProduct: string;
  expectedQuantity: string;
  remarks: string;
  customizationRequest: string;
  projectId?: string;
  quoteValue?: string;
  deliveryDate?: string;
  requirementSheet: Array<{ label: string; value: string }>;
  mockups: MockupAsset[];
  assets: AssetLink[];
  quotationVersions: QuoteVersion[];
  payments: PaymentRecord[];
  productionSteps: ProductionStep[];
  dispatch?: {
    courier: string;
    trackingNumber: string;
    trackingUrl: string;
    dispatchDate: string;
    estimatedDelivery: string;
  };
  timeline: TimelineEvent[];
  vedaSync: {
    manufacturingOrderReady: boolean;
    specRevision: string;
  };
};

export const dashboardBuckets: Array<{
  label: string;
  status: LeadStatus;
  count: number;
}> = [
  { label: "New Leads", status: "new", count: 8 },
  { label: "Open Projects", status: "open", count: 14 },
  { label: "Quotation Pending", status: "quotation_pending", count: 5 },
  { label: "Payment Pending", status: "payment_pending", count: 4 },
  { label: "Production Running", status: "production_running", count: 6 },
  { label: "Dispatch Pending", status: "dispatch_pending", count: 3 },
  { label: "Completed", status: "completed", count: 29 },
];

export const projectStages = [
  "Lead Created",
  "Sales Discussion",
  "Project Workspace",
  "Quotation",
  "Approval",
  "Advance Payment",
  "Production Specification",
  "Sample Approval",
  "Production",
  "Balance Payment",
  "Dispatch",
  "Completed",
] as const;

export const mockProjects: MerchProject[] = [
  {
    leadId: "LD-2026-021",
    status: "new",
    priority: "new",
    customerName: "Aman Bhatia",
    phone: "+91 98765 11223",
    organization: "North Valley Business School",
    selectedProduct: "Oversized T-Shirts",
    expectedQuantity: "180 units",
    remarks: "Freshers week launch in late August.",
    customizationRequest: "Matte puff print on front and woven neck label.",
    requirementSheet: [
      { label: "Product", value: "240 GSM oversized tee" },
      { label: "Print Type", value: "Screen print + puff ink" },
      { label: "Color", value: "Black / Bone" },
      { label: "Sizes", value: "S-XXL mixed ratio" },
      { label: "Delivery Date", value: "2026-08-26" },
    ],
    mockups: [],
    assets: [
      {
        label: "Reference board",
        type: "Figma",
        href: "https://figma.com/file/example-campus-drop",
      },
    ],
    quotationVersions: [],
    payments: [],
    productionSteps: [],
    timeline: [
      {
        id: "ev-ld-21",
        label: "Lead Created",
        actor: "Website",
        occurredAt: "2026-07-17 11:12",
      },
    ],
    vedaSync: {
      manufacturingOrderReady: false,
      specRevision: "draft",
    },
  },
  {
    leadId: "LD-2026-018",
    projectId: "PA-2026-0015",
    status: "payment_pending",
    priority: "active",
    customerName: "Nikita Sethi",
    phone: "+91 98989 20002",
    organization: "Asterlane Labs",
    selectedProduct: "Founders Kit",
    expectedQuantity: "85 kits",
    remarks: "Staggered delivery to Bangalore and Gurgaon.",
    customizationRequest: "Hoodie, bottle, notebook, rigid box, and welcome card.",
    quoteValue: "Rs. 1,92,500",
    deliveryDate: "2026-08-05",
    requirementSheet: [
      { label: "Product", value: "Premium onboarding kit" },
      { label: "Fabric", value: "420 GSM brushed fleece" },
      { label: "Packaging", value: "Rigid black magnet box" },
      { label: "Labels", value: "Woven neck label + hang tag" },
      { label: "Address", value: "Split dispatch across 2 offices" },
      { label: "GST", value: "29ABCDE1234F1Z7" },
    ],
    mockups: [
      {
        label: "Front Mockup",
        version: "v3",
        updatedAt: "2026-07-16",
        preview: "/products/hoodie.png",
      },
      {
        label: "Packaging",
        version: "v2",
        updatedAt: "2026-07-16",
        preview: "/products/kit.png",
      },
    ],
    assets: [
      {
        label: "Brand Guidelines",
        type: "PDF",
        href: "https://drive.google.com/file/d/example-brand-book",
      },
      {
        label: "Illustration Pack",
        type: "Google Drive",
        href: "https://drive.google.com/drive/folders/example-assets",
      },
      {
        label: "Address Sheet",
        type: "Google Sheets",
        href: "https://docs.google.com/spreadsheets/d/example-addresses",
      },
    ],
    quotationVersions: [
      { version: "V1", status: "changes_requested", sentAt: "2026-07-11 17:42" },
      { version: "V2", status: "approved", sentAt: "2026-07-15 10:10" },
    ],
    payments: [
      {
        label: "Advance Payment",
        amount: "Rs. 50,000",
        status: "paid",
        date: "2026-07-16",
        reference: "GPay-882110",
      },
      {
        label: "Balance Payment",
        amount: "Rs. 1,42,500",
        status: "pending",
      },
    ],
    productionSteps: [
      { label: "Material Ready", status: "done" },
      { label: "Printing", status: "active" },
      { label: "Embroidery", status: "upcoming" },
      { label: "Stitching", status: "upcoming" },
      { label: "QC", status: "upcoming" },
      { label: "Packing", status: "upcoming" },
      { label: "Ready For Dispatch", status: "upcoming" },
    ],
    timeline: [
      { id: "ev-1", label: "Lead Created", actor: "Website", occurredAt: "2026-07-09 12:04" },
      { id: "ev-2", label: "Discussion", actor: "Sales", occurredAt: "2026-07-10 16:20" },
      { id: "ev-3", label: "Project Created", actor: "Sales", occurredAt: "2026-07-10 16:48" },
      { id: "ev-4", label: "Quotation Approved", actor: "Client", occurredAt: "2026-07-15 18:03" },
      { id: "ev-5", label: "Advance Paid", actor: "Admin", occurredAt: "2026-07-16 11:11" },
      { id: "ev-6", label: "Production Started", actor: "Production", occurredAt: "2026-07-17 09:22" },
    ],
    vedaSync: {
      manufacturingOrderReady: true,
      specRevision: "rev-02",
    },
  },
  {
    leadId: "LD-2026-013",
    projectId: "PA-2026-0012",
    status: "dispatch_pending",
    priority: "watch",
    customerName: "Rhea Malhotra",
    phone: "+91 98111 00090",
    organization: "Crestline Consulting",
    selectedProduct: "Corporate Polo Program",
    expectedQuantity: "320 units",
    remarks: "Need tracked batches for three cities.",
    customizationRequest: "Embroidery on chest and individual polybag name stickers.",
    quoteValue: "Rs. 2,84,000",
    deliveryDate: "2026-07-23",
    requirementSheet: [
      { label: "Product", value: "240 GSM polo" },
      { label: "Embroidery", value: "8 cm left chest logo" },
      { label: "Packaging", value: "Named polybags by city" },
      { label: "Special Notes", value: "Separate ratio chart by location" },
    ],
    mockups: [
      {
        label: "Front Mockup",
        version: "final",
        updatedAt: "2026-07-05",
        preview: "/products/tshirt.png",
      },
    ],
    assets: [
      {
        label: "Logo Files",
        type: "ZIP",
        href: "https://dropbox.com/example-logo-pack",
      },
    ],
    quotationVersions: [
      { version: "V1", status: "approved", sentAt: "2026-07-02 14:18" },
    ],
    payments: [
      {
        label: "Advance Payment",
        amount: "Rs. 84,000",
        status: "paid",
        date: "2026-07-03",
        reference: "UTR493020",
      },
      {
        label: "Balance Payment",
        amount: "Rs. 2,00,000",
        status: "pending",
      },
    ],
    productionSteps: [
      { label: "Material Ready", status: "done" },
      { label: "Printing", status: "done" },
      { label: "Embroidery", status: "done" },
      { label: "Stitching", status: "done" },
      { label: "QC", status: "done" },
      { label: "Packing", status: "done" },
      { label: "Ready For Dispatch", status: "active" },
    ],
    dispatch: {
      courier: "Blue Dart",
      trackingNumber: "BLD82726119",
      trackingUrl: "https://www.bluedart.com/tracking?trackid=BLD82726119",
      dispatchDate: "2026-07-18",
      estimatedDelivery: "2026-07-22",
    },
    timeline: [
      { id: "ev-10", label: "Project Created", actor: "Sales", occurredAt: "2026-07-01 11:02" },
      { id: "ev-11", label: "Quotation Approved", actor: "Client", occurredAt: "2026-07-02 16:45" },
      { id: "ev-12", label: "Advance Paid", actor: "Admin", occurredAt: "2026-07-03 12:18" },
      { id: "ev-13", label: "Sample Approved", actor: "Client", occurredAt: "2026-07-08 18:28" },
      { id: "ev-14", label: "Production Complete", actor: "Production", occurredAt: "2026-07-16 19:14" },
    ],
    vedaSync: {
      manufacturingOrderReady: true,
      specRevision: "rev-03",
    },
  },
];

export function getProjectByIdentifier(identifier: string) {
  return mockProjects.find(
    (project) => project.projectId === identifier || project.leadId === identifier,
  );
}
