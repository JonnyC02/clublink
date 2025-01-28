import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import stripe from "../../src/utils/stripe";
import { sendEmail } from "../../src/utils/email";
import { Stripe } from "stripe";

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("../../src/utils/stripe", () => ({
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

jest.mock("../../src/utils/email", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../../src/utils/authentication", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1, email: "user@example.com" };
    next();
  }),
}));

const mockQuery = pool.query as jest.Mock;
const mockStripe = stripe as jest.Mocked<typeof stripe>;
const mockSendEmail = sendEmail as jest.Mock;

describe("Payment API Integration Tests", () => {
  const mockTransaction = { rows: [{ id: "tx_123" }] };

  const mockPaymentIntent: Stripe.Response<Stripe.PaymentIntent> = {
    id: "pi_test",
    object: "payment_intent",
    amount: 5000,
    amount_capturable: 0,
    amount_received: 0,
    client_secret: "pi_test_secret",
    currency: "GBP",
    metadata: { transaction: "tx_123" },
    status: "requires_payment_method",
    created: 1234567890,
    livemode: false,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: "automatic",
    confirmation_method: "automatic",
    customer: null,
    description: null,
    invoice: null,
    last_payment_error: null,
    latest_charge: null,
    next_action: null,
    on_behalf_of: null,
    payment_method: null,
    payment_method_options: {},
    payment_method_types: ["card"],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    transfer_data: null,
    transfer_group: null,
    application: null,
    application_fee_amount: null,
    payment_method_configuration_details: null,
    lastResponse: {
      headers: {
        "request-id": "req_test",
      },
      requestId: "req_test",
      statusCode: 200,
      apiVersion: "2020-08-27",
      idempotencyKey: "test_key",
      stripeAccount: "acct_test",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue(mockTransaction);
    (
      mockStripe.paymentIntents.create as jest.MockedFunction<
        typeof stripe.paymentIntents.create
      >
    ).mockResolvedValue(mockPaymentIntent);
  });

  describe("POST /payments", () => {
    it("should create a payment intent and send receipt", async () => {
      const res = await request(app)
        .post("/payments")
        .send({ amount: "50", desc: "Test Ticket", id: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("clientSecret", "pi_test_secret");

      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO transactions (memberId, ticketId) VALUES ($1, $2) RETURNING id",
        [1, 1]
      );

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5500,
        currency: "GBP",
        payment_method_types: ["card"],
        metadata: { transaction: "tx_123" },
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          subject: "Your ClubLink Receipt",
          html: expect.stringContaining("£50"),
        })
      );
    });

    it("should handle invalid amount", async () => {
      const res = await request(app)
        .post("/payments")
        .send({ amount: "invalid", desc: "Test", id: 1 });

      expect(res.status).toBe(500);
    });

    it("should handle missing required fields", async () => {
      const res = await request(app).post("/payments").send({ desc: "Test" });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /payments/webhook", () => {
    const mockWebhookEvent: Stripe.PaymentIntentSucceededEvent = {
      id: "evt_test",
      object: "event",
      type: "payment_intent.succeeded",
      data: {
        object: mockPaymentIntent,
      },
      created: 1234567890,
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: null,
    };

    beforeEach(() => {
      (
        mockStripe.webhooks.constructEvent as jest.MockedFunction<
          typeof stripe.webhooks.constructEvent
        >
      ).mockReturnValue(mockWebhookEvent);
    });

    it("should update transaction status on success", async () => {
      const res = await request(app)
        .post("/payments/webhook")
        .send({})
        .set("Stripe-Signature", "test_sig");

      expect(res.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE transactions SET status = $1, updated_at = $2 WHERE id = $3",
        ["succeeded", expect.any(String), "tx_123"]
      );
    });

    it("should handle failed payment", async () => {
      (
        mockStripe.webhooks.constructEvent as jest.MockedFunction<
          typeof stripe.webhooks.constructEvent
        >
      ).mockReturnValue({
        ...mockWebhookEvent,
        type: "payment_intent.payment_failed",
        data: {
          object: {
            ...mockWebhookEvent.data.object,
            status: "canceled",
          },
        },
      });

      const res = await request(app)
        .post("/payments/webhook")
        .send({})
        .set("Stripe-Signature", "test_sig");

      expect(res.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE transactions SET status = $1, updated_at = $2 WHERE id = $3",
        ["failed", expect.any(String), "tx_123"]
      );
    });

    it("should handle missing transaction reference", async () => {
      (
        mockStripe.webhooks.constructEvent as jest.MockedFunction<
          typeof stripe.webhooks.constructEvent
        >
      ).mockReturnValue({
        ...mockWebhookEvent,
        data: {
          object: {
            ...mockWebhookEvent.data.object,
            metadata: {},
          },
        },
      });

      const res = await request(app)
        .post("/payments/webhook")
        .send({})
        .set("Stripe-Signature", "test_sig");

      expect(res.status).toBe(400);
    });
  });
});
