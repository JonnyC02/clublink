import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import { hasPendingRequest } from "../../src/utils/user";

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("../../src/utils/authentication", () => ({
  ...jest.requireActual("../../src/utils/authentication"),
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
  getUserId: jest.fn(() => 1),
}));

jest.mock("../../src/utils/user", () => ({
  ...jest.requireActual("../../src/utils/user"),
  hasPendingRequest: jest.fn(),
}));

const mockQuery = pool.query as jest.Mock;

describe("Clubs API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST / (fetch clubs)", () => {
    it("should fetch a list of clubs sorted by popularity and universityPriority", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ university: "QUB" }],
        })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, name: "Test Club", university: "QUB", popularity: 10 },
          ],
        });

      const res = await request(app)
        .post("/clubs")
        .send({ latitude: 40.7128, longitude: -74.006 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("name", "Test Club");
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT university FROM Users WHERE id = $1"),
        [undefined]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SELECT"),
        expect.arrayContaining([40.7128, -74.006, "QUB"])
      );
    });

    it("should handle missing latitude and longitude", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ university: "QUB" }],
        })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, name: "Test Club", university: "QUB", popularity: 10 },
          ],
        });

      const res = await request(app).post("/clubs").send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("name", "Test Club");
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT university FROM Users WHERE id = $1"),
        [undefined]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SELECT"),
        expect.arrayContaining(["QUB"])
      );
    });
  });

  describe("GET /:id (fetch specific club)", () => {
    it("should fetch a specific club by ID", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "Test Club",
            description: "Detailed desc",
            university: "QUB",
          },
        ],
      });

      (hasPendingRequest as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .get("/clubs/1")
        .set("Authorization", "Bearer valid_token");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        Club: {
          id: 1,
          name: "Test Club",
          description: "Detailed desc",
          university: "QUB",
        },
        hasPending: false,
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(hasPendingRequest).toHaveBeenCalledWith(1, 1);
    });

    it("should return 404 for a non-existent club", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/clubs/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Club not found.");
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /:id/edit", () => {
    it("should update club details", async () => {
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 1,
            name: "Test Club",
            description: "Updated description",
          },
        ],
      });

      const updatedDetails = {
        description: "Updated description",
        shortdescription: "Updated short desc",
        headerimage: "headerimageurl",
        image: "imageurl",
      };

      const res = await request(app).post("/clubs/1/edit").send(updatedDetails);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Club details updated successfully."
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE"),
        [
          "Updated description",
          "Updated short desc",
          "headerimageurl",
          "imageurl",
          "1",
        ]
      );
    });

    it("should return 404 for a non-existent club", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .post("/clubs/999/edit")
        .send({ description: "Test" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Club not found.");
    });
  });
});
