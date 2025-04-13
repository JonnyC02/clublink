import {
  isStudent,
  hasPendingRequest,
  getAllClubs,
} from "../../src/utils/user";
import pool from "../../src/db/db";

jest.mock("../../src/db/db");
const mockedPoolQuery = pool.query as jest.Mock;

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const normalizeQuery = (query: string) => query.trim().replace(/\s+/g, " ");

const expectedQuery = normalizeQuery(`
        SELECT c.id AS clubId, c.name AS clubName, c.shortDescription, c.image, m.status, CASE WHEN m.memberType = 'Committee' THEN true ELSE false END AS isCommittee, t.id AS ticketId, t.name AS ticketName, t.price AS ticketPrice, t.ticketType, t.ticketFlag FROM MemberList m INNER JOIN Clubs c ON m.clubId = c.id INNER JOIN Users u ON m.memberId = u.id LEFT JOIN Tickets t ON m.clubId = t.clubId AND ( (u.studentNumber IS NOT NULL AND t.ticketFlag = 'Student') OR (u.studentNumber IS NULL AND t.ticketFlag = 'Associate') ) WHERE m.memberId = $1;
    `);

describe("User Utils", () => {
  const mockClubs = [
    {
      status: undefined,
      id: undefined,
      image: "chessclub.png",
      iscommittee: undefined,
      membershipticket: null,
      name: undefined,
      shortdescription: undefined,
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isStudent", () => {
    it("should return true if the user is a student", async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rowCount: 1,
        rows: [{ studentnumber: "12345678" }],
      });

      const result = await isStudent(1);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT studentnumber FROM users WHERE id = $1",
        [1]
      );
    });

    it("should return false if the user is not a student", async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rowCount: 1,
        rows: [{ studentnumber: null }],
      });

      const result = await isStudent(1);

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT studentnumber FROM users WHERE id = $1",
        [1]
      );
    });

    it("should throw an error if the user is not found", async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(isStudent(1)).rejects.toThrow("User not found!");
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT studentnumber FROM users WHERE id = $1",
        [1]
      );
    });

    it("should handle database errors gracefully", async () => {
      const mockError = new Error("Database error");
      (pool.query as jest.Mock).mockRejectedValue(mockError);

      await expect(isStudent(1)).rejects.toThrow("Database error");
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT studentnumber FROM users WHERE id = $1",
        [1]
      );
    });
  });

  describe("hasPendingRequest", () => {
    const mockUserId = 1;
    const mockClubId = 2;

    it("should return true if there is a pending request", async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rowCount: 1,
        rows: [{}],
      });

      const result = await hasPendingRequest(mockUserId, mockClubId);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT 1 FROM requests WHERE memberId = $1 AND clubId = $2 AND status = $3",
        [mockUserId, mockClubId, "Pending"]
      );
    });

    it("should return false if there is no pending request", async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      const result = await hasPendingRequest(mockUserId, mockClubId);

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT 1 FROM requests WHERE memberId = $1 AND clubId = $2 AND status = $3",
        [mockUserId, mockClubId, "Pending"]
      );
    });

    it("should throw an error if the database query fails", async () => {
      const mockError = new Error("Database error");
      (pool.query as jest.Mock).mockRejectedValue(mockError);

      await expect(hasPendingRequest(mockUserId, mockClubId)).rejects.toThrow(
        "Failed to check pending request."
      );
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT 1 FROM requests WHERE memberId = $1 AND clubId = $2 AND status = $3",
        [mockUserId, mockClubId, "Pending"]
      );
    });
  });

  describe("getAllClubs", () => {
    const mockUserId = 1;

    it("should return a list of clubs with committee status", async () => {
      mockedPoolQuery.mockResolvedValue({ rows: mockClubs });

      const result = await getAllClubs(mockUserId);

      expect(result).toEqual(mockClubs);
      expect(normalizeQuery(mockedPoolQuery.mock.calls[0][0])).toEqual(
        expectedQuery
      );
      expect(mockedPoolQuery).toHaveBeenCalledWith(expect.any(String), [
        mockUserId,
      ]);
    });

    it("should return an empty array if the user has no clubs", async () => {
      mockedPoolQuery.mockResolvedValue({ rows: [] });

      const result = await getAllClubs(mockUserId);

      expect(result).toEqual([]);
      expect(normalizeQuery(mockedPoolQuery.mock.calls[0][0])).toEqual(
        expectedQuery
      );
      expect(mockedPoolQuery).toHaveBeenCalledWith(expect.any(String), [
        mockUserId,
      ]);
    });

    it("should throw an error if the database query fails", async () => {
      mockedPoolQuery.mockRejectedValue(new Error("Database error"));

      await expect(getAllClubs(mockUserId)).rejects.toThrow(
        "Error: Database error"
      );
      expect(normalizeQuery(mockedPoolQuery.mock.calls[0][0])).toEqual(
        expectedQuery
      );
      expect(mockedPoolQuery).toHaveBeenCalledWith(expect.any(String), [
        mockUserId,
      ]);
    });
    it("should throw an error if there is no userId", async () => {
      await expect(getAllClubs(undefined)).rejects.toThrow("No User Id");
    });
  });
});
