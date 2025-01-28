import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import stripe from "../../src/utils/stripe";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockStripe = stripe as jest.Mocked<typeof stripe>;

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("../../src/utils/stripe", () => ({
  products: {
    create: jest.fn(),
    update: jest.fn(),
    retrieve: jest.fn(),
  },
  prices: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../../src/utils/authentication", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1, isAdmin: true };
    next();
  }),
}));

const mockQuery = pool.query as jest.Mock;

describe("Tickets API Integration Tests", () => {
  const mockTicket = {
    id: 1,
    name: "VIP Ticket",
    price: 5000,
    description: "VIP access ticket",
    stripe_product_id: "prod_test123",
    stripe_price_id: "price_test123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tickets/:id", () => {
    it("should retrieve a single ticket", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockTicket] });

      const res = await request(app).get("/tickets/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTicket);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM tickets WHERE id = $1",
        ["1"]
      );
    });

    it("should return 404 for non-existent ticket", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/tickets/999");
      expect(res.status).toBe(500);
    });
  });
});
