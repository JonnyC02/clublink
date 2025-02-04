import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import Checkout from "../../src/pages/Checkout";
import { isAuthenticated } from "../../src/utils/auth";
import React from "react";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@stripe/react-stripe-js", () => ({
  ...jest.requireActual("@stripe/react-stripe-js"),
  useStripe: jest.fn(),
  useElements: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardElement: ({ options }: { options: any }) => (
    <input data-testid="mock-card-element" {...options} />
  ),
}));

jest.mock("../../src/utils/auth", () => ({
  isAuthenticated: jest.fn(),
}));

const mockStripe = {
  confirmCardPayment: jest.fn(),
};

const mockElements = {
  getElement: jest.fn(),
};

const mockTicket = {
  id: 123,
  name: "VIP Ticket",
  price: 50,
  tickettype: "vip",
};

beforeEach(() => {
  window.localStorage.setItem("token", "mock-jwt-token");
  (useParams as jest.Mock).mockReturnValue({ id: "123" });
  (useStripe as jest.Mock).mockReturnValue(mockStripe);
  (useElements as jest.Mock).mockReturnValue(mockElements);
  (isAuthenticated as jest.Mock).mockReturnValue(true);
  (mockElements.getElement as jest.Mock).mockReturnValue({});

  global.fetch = jest.fn((url) =>
    url.includes("/tickets/123")
      ? Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTicket),
        })
      : Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clientSecret: "test_secret_123" }),
        })
  ) as jest.Mock;
});

afterEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

describe("Checkout Component", () => {
  test("loads and displays ticket information", async () => {
    render(<Checkout />);

    await waitFor(() => {
      expect(screen.getByText(/VIP Ticket/i)).toBeDefined();
      expect(screen.getByText(/£50/i)).toBeDefined();
    });
  });

  test("handles successful payment submission", async () => {
    (mockStripe.confirmCardPayment as jest.Mock).mockResolvedValue({
      error: null,
    });

    render(<Checkout />);

    await waitFor(() => screen.getByText(/Pay Now/i));

    fireEvent.submit(screen.getByTestId("payment-form"));

    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("undefined/payments"),
        expect.objectContaining({
          body: '{"amount":0}',
          headers: {
            Authorization: "Bearer mock-jwt-token",
            "Content-type": "application/json; charset=utf-8",
          },
          method: "POST",
        })
      );
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
        "test_secret_123",
        expect.objectContaining({
          payment_method: { card: {} },
        })
      );
      expect(screen.getByText(/Payment Successful!/i)).toBeDefined();
    });
  });

  test("handles payment submission errors", async () => {
    (mockStripe.confirmCardPayment as jest.Mock).mockResolvedValue({
      error: { message: "Your card has been declined." },
    });

    render(<Checkout />);

    await waitFor(() => screen.getByText(/Pay Now/i));
    fireEvent.submit(screen.getByTestId("payment-form"));

    await waitFor(() => {
      expect(screen.getByText(/Your card has been declined./i)).toBeDefined();
    });
  });

  test("shows loading state during payment processing", async () => {
    (mockStripe.confirmCardPayment as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 1000)
        )
    );

    render(<Checkout />);

    await waitFor(() => screen.getByText(/Pay Now/i));
    fireEvent.submit(screen.getByTestId("payment-form"));

    expect(screen.getByText(/Processing.../i)).toBeDefined();
  });

  test("handles API fetch errors", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false })
    );

    render(<Checkout />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch ticket data/i)).toBeDefined();
    });
  });

  test("shows error when Stripe not loaded", async () => {
    (useStripe as jest.Mock).mockReturnValue(null);

    render(<Checkout />);

    await waitFor(() => screen.getByText(/Pay Now/i));
    fireEvent.submit(screen.getByTestId("payment-form"));

    expect(screen.getByText(/Stripe.js has not loaded/i)).toBeDefined();
  });
});
