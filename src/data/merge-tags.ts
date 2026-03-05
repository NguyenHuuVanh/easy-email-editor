// Merge tags data for personalization variables
export const mergeTags = {
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

export const mergeTagGenerate = (tag: string) => `{{${tag}}}`;
