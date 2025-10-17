export function toQS(
  params: Record<string, string | number | undefined | null>,
) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : '';
}
