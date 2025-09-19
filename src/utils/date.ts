
export const today = () => new Date();
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};
export const diffInDays = (a: Date, b: Date) => {
  const ms = a.setHours(0, 0, 0, 0) - b.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

export const dateFromDaysAgo = (daysAgo: number) => addDays(today(), -daysAgo);

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });