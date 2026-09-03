export function formatPrice(
  amount: number,
  currency: string = 'INR',
  symbol: string = '₹'
): string {
  return `${symbol}${Number(amount).toFixed(2)}`
}
