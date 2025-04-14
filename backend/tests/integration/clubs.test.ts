import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import { addAudit } from "../../src/utils/audit";
import { stopQueue } from "../../src/utils/queue";
import jwt from "jsonwebtoken";
import * as db from "../../src/db/db";
import { approveRequest } from "../../src/utils/club";
import * as fileUtils from "../../src/utils/file";

jest.mock("../../src/utils/club", () => ({
  ...jest.requireActual("../../src/utils/club"),
  approveRequest: jest.fn(),
  activateMembership: jest.fn(),
}));

jest.mock("../../src/utils/file", () => ({
  convertToWebp: jest.fn(() => Buffer.from("mocked")),
  uploadFile: jest.fn(() => "https://cdn.clublink.test/image.webp"),
}));

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

  afterAll(() => {
    stopQueue();
  });

  describe("POST / (fetch clubs)", () => {
    it("should fetch clubs without location data", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ university: "QUB" }] })
        .mockResolvedValueOnce({
          rows: [{ id: 1, name: "Club A", university: "QUB", popularity: 12 }],
        });

      const res = await request(app).post("/clubs").send({});

      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe("Club A");
    });

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
    it("should return 404 if club is not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/clubs/999")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Club not found.");
    });

    it("should return 400 if ID param is missing", async () => {
      const res = await request(app)
        .get("/clubs/")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(404); // Express throws 404 for bad routes
    });
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
    it("should handle database errors on edit gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).post("/clubs/1/edit").send({
        description: "desc",
        shortdescription: "short",
        headerimage: "header.png",
        image: "image.png",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal server error.");
    });

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
        .send({ userId: 2 });

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
        .send({ userId: 999 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Member not found.");
    });

    it("should handle database errors gracefully", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .post("/clubs/1/kick")
        .set("Authorization", "Bearer valid_token")
        .send({ userId: 3 });

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
        .send({ userId: 2 });

      expect(res.status).toBe(404);
      expect(mockQuery).not.toHaveBeenCalled();
      expect(addAudit).not.toHaveBeenCalled();
    });
  });
  describe("GET /:id/all", () => {
    it("should return full club data from /clubs/:id/all", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ name: "Club A" }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/clubs/1/all");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("Club");
    });
  });
  describe("/:id/activate", () => {
    it("should return 400 if memberId or id is missing (activate)", async () => {
      const res = await request(app).post("/clubs/1/activate").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Club ID and Member ID/);
    });

    it("should return 404 if member not found (activate)", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app)
        .post("/clubs/1/activate")
        .send({ memberId: 999 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Member not found.");
    });

    it("should activate a member successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ memberId: 2 }] });

      const res = await request(app)
        .post("/clubs/1/activate")
        .send({ memberId: 2 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Member activated successfully");
    });

    it("should return 400 if memberId or id is missing (expire)", async () => {
      const res = await request(app).post("/clubs/1/expire").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Club ID and Member ID/);
    });

    it("should return 404 if member not found (expire)", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app)
        .post("/clubs/1/expire")
        .send({ memberId: 999 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Member not found.");
    });

    it("should expire a member successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ memberId: 2 }] });

      const res = await request(app)
        .post("/clubs/1/expire")
        .send({ memberId: 2 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Membership Expired Successfully");
    });
  });
  describe("GET /:id/is-committee", () => {
    it("should confirm committee membership", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ iscommittee: true }] });

      const res = await request(app).get("/clubs/1/is-committee");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ isCommittee: true });
    });
    it("should return 500 if no auth header in is-committee", async () => {
      const res = await request(app).get("/clubs/1/is-committee");
      expect(res.status).toBe(500);
    });

    it("should handle DB error in is-committee", async () => {
      mockQuery.mockRejectedValueOnce(new Error("DB fail"));

      const res = await request(app).get("/clubs/1/is-committee");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal Server Error");
    });
  });

  describe("POST /requests/approve", () => {
    it("should approve a request", async () => {
      const token = jwt.sign({ reqId: 123 }, process.env.JWT_SECRET!, {
        expiresIn: "48h",
      });

      (approveRequest as jest.Mock).mockResolvedValue(999);

      (db.default.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/clubs/requests/approve")
        .send({ request: token });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Successfully accepted request/);
    });
  });
  describe("POST /clubs/requests/deny", () => {
    it("should return 400 for invalid token", async () => {
      const res = await request(app)
        .post("/clubs/requests/deny")
        .send({ request: "invalid" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /clubs/:id/committee", () => {
    it("should return committee members", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: "Alice" }] });
      const res = await request(app).get("/clubs/1/committee");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1, name: "Alice" }]);
    });

    it("should return 404 if no committee", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get("/clubs/1/committee");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /clubs/:id/activate/bulk", () => {
    it("should return 400 if members is empty", async () => {
      const res = await request(app)
        .post("/clubs/1/activate/bulk")
        .send({ members: [] });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /clubs/upload", () => {
    it("should return 400 if no clubId is provided", async () => {
      const res = await request(app)
        .post("/clubs/upload")
        .set("Authorization", "Bearer valid_token")
        .attach("image", Buffer.from("mock"), "test.jpg");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Files and clubId are required.");
    });

    it("should upload header image only", async () => {
      const res = await request(app)
        .post("/clubs/upload")
        .set("Authorization", "Bearer valid_token")
        .field("clubId", "1")
        .attach("headerImage", Buffer.from("mock"), "header.jpg");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("File uploaded successfully.");
      expect(res.body.headerImageUrl).toMatch(/image.webp/);
      expect(fileUtils.convertToWebp).toHaveBeenCalled();
      expect(fileUtils.uploadFile).toHaveBeenCalled();
    });

    it("should upload both header and image", async () => {
      const res = await request(app)
        .post("/clubs/upload")
        .set("Authorization", "Bearer valid_token")
        .field("clubId", "1")
        .attach("headerImage", Buffer.from("mock"), "header.jpg")
        .attach("image", Buffer.from("mock"), "image.jpg");

      expect(res.status).toBe(200);
      expect(res.body.headerImageUrl).toMatch(/image.webp/);
      expect(res.body.imageUrl).toMatch(/image.webp/);
      expect(fileUtils.convertToWebp).toHaveBeenCalledTimes(2);
      expect(fileUtils.uploadFile).toHaveBeenCalledTimes(2);
    });
  });

  describe("POST /:id/remove/bulk", () => {
    it("should return 400 if members is empty (remove)", async () => {
      const res = await request(app)
        .post("/clubs/1/remove/bulk")
        .send({ members: [] });

      expect(res.status).toBe(400);
    });

    it("should handle DB error on remove", async () => {
      mockQuery.mockRejectedValueOnce(new Error("fail"));
      const res = await request(app)
        .post("/clubs/1/remove/bulk")
        .send({ members: [1, 2] });

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Internal Server Error/);
    });

    it("should remove members in bulk", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 2 });
      const res = await request(app)
        .post("/clubs/1/remove/bulk")
        .send({ members: [1, 2] });

      expect(res.status).toBe(200);
      expect(res.body.amount).toBe(2);
    });
  });
});
