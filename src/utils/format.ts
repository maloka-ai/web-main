export const formatCurrency = (
  amount: number,
  locale: string = "pt-BR",
  currency: string = "BRL",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export function formatTitleHeaderTable(snake: string) {
  return snake
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatNumber(n: number) {
  return n.toLocaleString('pt-BR');
}
