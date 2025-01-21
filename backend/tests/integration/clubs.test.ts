import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import { addAudit } from "../../src/utils/audit";

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

jest.mock("../../src/utils/audit", () => ({
  addAudit: jest.fn(),
}));

const mockQuery = pool.query as jest.Mock;

describe("Clubs API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST / (fetch clubs)", () => {
    it("should fetch a list of clubs sorted by popularity and universityPriority", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ university: "QUB" }] })
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
    });
  });

  describe("GET /:id (fetch specific club)", () => {
    it("should fetch a specific club by ID", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              name: "Test Club",
              description: "Detailed desc",
              university: "QUB",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{}],
        });

      const res = await request(app)
        .get("/clubs/1")
        .set("authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        Club: {
          id: 1,
          name: "Test Club",
          description: "Detailed desc",
          university: "QUB",
        },
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe("POST /:id/edit (edit club)", () => {
    it("should update club details", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, name: "Test Club", description: "Updated description" },
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
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /:id/kick (kick member)", () => {
    it("should successfully kick a member from a club", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, name: "Test Club", description: "Updated description" },
        ],
      });

      const res = await request(app)
        .post("/clubs/1/kick")
        .set("Authorization", "Bearer valid_token")
        .send({ memberId: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Member removed successfully");
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM MemberList WHERE clubId = $1 AND memberId = $2 RETURNING id",
        ["1", 2]
      );
      expect(addAudit).toHaveBeenCalledWith(1, 1, 2, "Kick");
    });

    it("should return 404 if the member is not in the club", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/clubs/1/kick")
        .set("Authorization", "Bearer valid_token")
        .send({ memberId: 999 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Member not found.");
    });

    it("should handle database errors gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .post("/clubs/1/kick")
        .set("Authorization", "Bearer valid_token")
        .send({ memberId: 3 });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Internal server error");
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM MemberList WHERE clubId = $1 AND memberId = $2 RETURNING id",
        ["1", 3]
      );
      expect(addAudit).not.toHaveBeenCalled();
    });

    it("should return 400 if no memberId is provided", async () => {
      const res = await request(app)
        .post("/clubs/1/kick")
        .set("Authorization", "Bearer valid_token")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "Invalid request. Club ID and Member ID are required."
      );
      expect(mockQuery).not.toHaveBeenCalled();
      expect(addAudit).not.toHaveBeenCalled();
    });

    it("should return 404 if no clubId is provided", async () => {
      const res = await request(app)
        .post("/clubs//kick")
        .set("Authorization", "Bearer valid_token")
        .send({ memberId: 2 });

      expect(res.status).toBe(404);
      expect(mockQuery).not.toHaveBeenCalled();
      expect(addAudit).not.toHaveBeenCalled();
    });
  });
});
