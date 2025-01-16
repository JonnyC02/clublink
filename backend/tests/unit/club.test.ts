import {
  joinClub,
  requestJoinClub,
  approveRequest,
  denyRequest,
} from "../../src/utils/club";
import pool from "../../src/db/db";

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

describe("Club Utils", () => {
  const mockUserId = 1;
  const mockClubId = "2";
  const mockRequestId = "3";
  const mockDate = new Date().toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("joinClub", () => {
    it("should insert a membership into the MemberList table", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await joinClub(mockClubId, mockUserId);

      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO memberlist (memberId, clubId) VALUES ($1, $2)",
        [mockUserId, mockClubId]
      );
    });

    it("should throw an error if the query fails", async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(
        new Error("Database Error")
      );

      await expect(joinClub(mockClubId, mockUserId)).rejects.toThrow(
        "Database Error"
      );
    });
  });

  describe("requestJoinClub", () => {
    it("should insert a request into the Requests table", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await requestJoinClub(mockClubId, mockUserId);

      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO requests (memberId, clubId) VALUES ($1, $2)",
        [mockUserId, mockClubId]
      );
    });

    it("should throw an error if the query fails", async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(
        new Error("Database Error")
      );

      await expect(requestJoinClub(mockClubId, mockUserId)).rejects.toThrow(
        "Database Error"
      );
    });
  });

  describe("approveRequest", () => {
    it("should update the request, approve it, and add the user to the club", async () => {
      const mockRequestResult = {
        rows: [{ clubid: mockClubId, memberid: mockUserId }],
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockRequestResult)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await approveRequest(mockRequestId, mockUserId);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        "UPDATE requests SET status = 'Approved', approverid = $1, updated_at = $2 WHERE id = $3 RETURNING clubid, memberid",
        [mockUserId, mockDate, mockRequestId]
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO auditlog (clubid, memberid, userid, actiontype) VALUES ($1, $2, $3, $4);",
        [mockClubId, mockUserId, mockUserId, "approve"]
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        3,
        "INSERT INTO memberlist (memberId, clubId) VALUES ($1, $2)",
        [mockUserId, mockClubId]
      );
    });

    it("should throw an error if no rows are returned by the update", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(approveRequest(mockRequestId, mockUserId)).rejects.toThrow(
        "Unable to approve request: No rows returned"
      );
    });

    it("should throw an error if joining the club fails", async () => {
      const mockRequestResult = {
        rows: [{ clubid: mockClubId, memberid: mockUserId }],
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockRequestResult)
        .mockRejectedValueOnce(new Error("Join Club Failed"));

      await expect(approveRequest(mockRequestId, mockUserId)).rejects.toThrow(
        "Join Club Failed"
      );
    });
  });

  describe("denyRequest", () => {
    it('should update the request and set the status to "Denied"', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ clubid: 1, memberid: 2 }],
      });

      await denyRequest(mockRequestId, mockUserId);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE requests SET status = 'Denied', approverid = $1, updated_at = $2 WHERE id = $3 RETURNING clubid, memberid",
        [mockUserId, mockDate, mockRequestId]
      );
    });

    it("should throw an error if the query fails", async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(
        new Error("Database Error")
      );

      await expect(denyRequest(mockRequestId, mockUserId)).rejects.toThrow(
        "Database Error"
      );
    });
  });
});
