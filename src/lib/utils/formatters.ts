export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}
