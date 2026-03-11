export const salesKeys = {
  topByCustomerId: (customerId: number) => [
    'sales',
    'topByCustomer',
    customerId,
  ],
  averageMonthlyDiscount: (mes?: number, ano?: number) => [
    'averageMonthlyDiscount',
    mes,
    ano,
  ],
  monthlyGrossProfit: (mes?: number, ano?: number) => [
    'monthlyGrossProfit',
    mes,
    ano,
  ],
  monthlyReturnPercentage: (mes?: number, ano?: number) => [
    'monthlyReturnPercentage',
    mes,
    ano,
  ],
};
