import { Asset, split } from 'eos-common'

const rawTrades = [
  [1.0, 100, 100, 0.99],
  [2.0, 101, 99, 1.92],
  [4.0, 103, 97, 3.63],
  // [16.0, 115, 87, 10.62],
  // [32.0, 131, 76, 14.99],
  // [64.0, 163, 61, 17.3],
  // [128.0, 227, 44, 15.88],
  // [256.0, 355, 28, 11.8],
  // [512.0, 611, 16, 7.46],
  // [1024.0, 1123, 9, 4.25],
  // [2048.0, 2147, 5, 2.27],
  // [4096.0, 4195, 2, 1.18]
];

export const trades = rawTrades.map(([amount, bluBalance, redBalance, reward]) => ({
    amount: split(`${amount.toFixed(2)} BLU`),
    bluBalance: split(`${bluBalance.toFixed(2)} BLU`),
    redBalance: split(`${redBalance.toFixed(2)} RED`),
    reward: split(`${reward.toFixed(2)} RED`)
}))

