// ---- Merge Tag Definitions (Pro-style with types) ----
// type: "text" | "image" | "link"
export interface MergeTagItem {
  label: string;
  value: string;
  type?: "text" | "image" | "link";
  children?: MergeTagItem[];
}

export const mergeTagDefinitions: MergeTagItem[] = [
  {
    label: "Customer",
    value: "",
    children: [
      { label: "Name", value: "customer.name", type: "text" },
      { label: "First Name", value: "customer.first_name", type: "text" },
      { label: "Last Name", value: "customer.last_name", type: "text" },
      { label: "Email", value: "customer.email", type: "text" },
      { label: "Phone", value: "customer.phone", type: "text" },
      { label: "Address", value: "customer.address", type: "text" },
    ],
  },
  {
    label: "Company",
    value: "",
    children: [
      { label: "Name", value: "company.name", type: "text" },
      { label: "Logo", value: "company.logo", type: "image" },
      { label: "Website", value: "company.website", type: "link" },
      { label: "Address", value: "company.address", type: "text" },
      { label: "Phone", value: "company.phone", type: "text" },
      { label: "Email", value: "company.email", type: "text" },
    ],
  },
  {
    label: "Order",
    value: "",
    children: [
      { label: "Order ID", value: "order.id", type: "text" },
      { label: "Total", value: "order.total", type: "text" },
      { label: "Date", value: "order.date", type: "text" },
      { label: "Status", value: "order.status", type: "text" },
      {
        label: "Tracking Number",
        value: "order.tracking_number",
        type: "text",
      },
      { label: "Items Count", value: "order.items_count", type: "text" },
    ],
  },
  {
    label: "Common",
    value: "",
    children: [
      { label: "Unsubscribe Link", value: "unsubscribe.link", type: "link" },
      { label: "Unsubscribe Text", value: "unsubscribe.text", type: "text" },
    ],
  },
  {
    label: "Custom",
    value: "",
    children: [
      { label: "Field 1", value: "custom.field_1", type: "text" },
      { label: "Field 2", value: "custom.field_2", type: "text" },
      { label: "Field 3", value: "custom.field_3", type: "text" },
    ],
  },
];

// ---- Merge Tags Data (actual values for preview) ----
export const defaultMergeTagsData: Record<string, any> = {
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    address: "123 Main Street, New York, NY 10001",
    first_name: "John",
    last_name: "Doe",
  },
  company: {
    name: "Acme Corporation",
    logo: "https://via.placeholder.com/150x50?text=Logo",
    website: "https://example.com",
    address: "456 Business Ave, San Francisco, CA 94102",
    phone: "+1 800 123 4567",
    email: "info@example.com",
  },
  order: {
    id: "ORD-2024-001",
    total: "$99.99",
    date: "2024-01-15",
    status: "Shipped",
    tracking_number: "1Z999AA10123456784",
    items_count: "3",
  },
  unsubscribe: {
    link: "https://example.com/unsubscribe",
    text: "Unsubscribe",
  },
  custom: {
    field_1: "Custom Value 1",
    field_2: "Custom Value 2",
    field_3: "Custom Value 3",
  },
};

// Build the flat mergeTags object that easy-email-editor expects
// This uses mergeTagsData values so preview shows real data
export const mergeTags = defaultMergeTagsData;

export const mergeTagGenerate = (tag: string) => `{{${tag}}}`;

// Helper: get value from nested object by dot path
export function getValueByPath(obj: Record<string, any>, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "";
}

// Helper: set value in nested object by dot path
export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: string,
): Record<string, any> {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}
