export const calculateFee = (amount: number): number => {
  if (amount <= 0) {
    return 0;
  }
  return Math.round(amount * 1.1 * 100) / 100;
};
