import Big from "big.js";

export function divide(x: number, y: number) {
  const bigX = new Big(x);
  const quo = bigX.div(new Big(y));
  return parseFloat(quo.toFixed(2));
}
