export function formatPrice(
  amount: number,
  currency: string = 'USD',
  symbol: string = '$'
): string {
  return `${symbol}${Number(amount).toFixed(2)}`
}
