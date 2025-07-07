export const formatCurrency = (
  amount: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};