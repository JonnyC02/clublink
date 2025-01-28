import { calculateFee } from "../../src/utils/payment";
describe("calculateFee", () => {
  it("should calculate a 10% fee for a positive amount", () => {
    const amount = 100;
    const result = calculateFee(amount);
    expect(result).toBe(110);
  });

  it("should return 0 for an amount of 0", () => {
    const amount = 0;
    const result = calculateFee(amount);
    expect(result).toBe(0);
  });

  it("should return 0 for a negative amount", () => {
    const amount = -50;
    const result = calculateFee(amount);
    expect(result).toBe(0);
  });

  it("should handle large amounts correctly", () => {
    const amount = 1000000;
    const result = calculateFee(amount);
    expect(result).toBe(1100000);
  });
});
