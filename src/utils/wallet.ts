import { type Address } from 'viem'

export function truncateAddress({
  address,
  start = 4,
  end = 4,
}: {
  address: Address
  start?: number
  end?: number
}) {
  if (!address) return ''
  return `${address.slice(0, start + 2)}...${address.slice(-end)}`
}
