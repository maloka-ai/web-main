export const analysisKeys = {
  alerts: ['alertsCockipt'] as const,
  segmentationClient: ['segmentationClient'] as const,
  customerQuarterlyRecurrence: (year: number) =>
    ['customerQuarterlyRecurrence', year] as const,
  customerAnnualRecurrence: (year: number) =>
    ['customerAnnualRecurrence', year] as const,
  annualRevenues: ['annualRevenues'] as const,
  monthlyRevenues: (year?: number) => ['monthlyRevenue', year] as const,
  dailyRevenues: (year: number, month?: number) =>
    ['ailyRevenues', year, month] as const,
  stockMetrics: ['stockMetrics'] as const,
};
