import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import { stopQueue } from "../../src/utils/queue";

jest.mock("../../src/utils/stripe", () => ({
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

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
  afterAll(() => {
    stopQueue();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tickets/:id", () => {
    it("should retrieve a single ticket", async () => {
      const mockTicket = {
        id: 1,
        name: "VIP Ticket",
        price: 5000,
        description: "VIP access ticket",
        stripe_product_id: "prod_test123",
        stripe_price_id: "price_test123",
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockTicket] });

      const res = await request(app).get("/tickets/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTicket);
    });

    it("should return 500 for non-existent ticket", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/tickets/999");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        "message",
        "Error Fetching Ticket Details"
      );
    });
  });

  describe("POST /tickets/code/validate", () => {
    it("should return 400 if no code is provided", async () => {
      const res = await request(app).post("/tickets/code/validate").send({});
      expect(res.status).toBe(400);
    });

    it("should return 404 if promo code does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app)
        .post("/tickets/code/validate")
        .send({ code: "INVALIDCODE", ticketId: 1 });
      expect(res.status).toBe(404);
    });

    it("should return 403 if promo code is expired", async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);
      expiredDate.setHours(0, 0, 0, 0);

      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            discount: 0.5,
            expirydate: expiredDate.toISOString(),
            maxuses: 5,
          },
        ],
      });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/tickets/code/validate")
        .send({ code: "EXPIRED", ticketId: 1 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Promo Code has Expired");
    });

    it("should return 403 if max uses exceeded", async () => {
      mockQuery.mockReset();
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            discount: 0.2,
            maxuses: 1,
            expirydate: null,
          },
        ],
      });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

      const res = await request(app)
        .post("/tickets/code/validate")
        .send({ code: "MAXEDOUT", ticketId: 1 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Max Uses Reached");
    });

    it("should validate and return discount successfully", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            discount: 0.25,
            maxuses: 0,
          },
        ],
      });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/tickets/code/validate")
        .send({ code: "VALID10", ticketId: 1 });

      expect(res.status).toBe(200);
      expect(res.body.discount).toBe(0.25);
    });
  });

  describe("POST /tickets/code/delete", () => {
    it("should return 400 if no ID provided", async () => {
      const res = await request(app).post("/tickets/code/delete").send({});
      expect(res.status).toBe(400);
    });

    it("should delete promo code successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ clubid: 1 }] });
      const res = await request(app)
        .post("/tickets/code/delete")
        .send({ id: 1 });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Promo Code Deleted");
    });
  });

  describe("POST /tickets/code/add", () => {
    it("should return 400 if no clubId is provided", async () => {
      const res = await request(app).post("/tickets/code/add").send({});
      expect(res.status).toBe(400);
    });

    it("should add a promo code successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({});
      const res = await request(app)
        .post("/tickets/code/add")
        .send({ clubId: 1 });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Promo Code Added");
    });
  });

  describe("POST /tickets/edit", () => {
    it("should return 400 if no tickets are provided", async () => {
      const res = await request(app).post("/tickets/edit").send({});
      expect(res.status).toBe(400);
    });

    it("should edit ticket successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ clubid: 1 }] });
      const res = await request(app)
        .post("/tickets/edit")
        .send({
          tickets: [
            {
              id: 1,
              price: 50,
              ticketexpiry: null,
              cashenabled: false,
              date: "2025-04-14",
              bookingfee: true,
            },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Tickets Updated");
    });
  });

  describe("POST /tickets/code/save", () => {
    it("should return 400 if no code is provided", async () => {
      const res = await request(app).post("/tickets/code/save").send({});
      expect(res.status).toBe(400);
    });

    it("should update code successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ clubid: 1 }] });
      const res = await request(app)
        .post("/tickets/code/save")
        .send({
          code: {
            id: 1,
            discount: 10,
            maxuse: 100,
            ticketid: 1,
            expirydate: "2025-12-31",
            code: "SAVE10",
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Code Updated");
    });
  });
});
