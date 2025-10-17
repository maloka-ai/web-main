export const customerKeys = {
  all: ['customers'] as const,
  detail: (id: number) => ['customer', id] as const,
  sales: (id: number) => ['customerSales', id] as const,
};
