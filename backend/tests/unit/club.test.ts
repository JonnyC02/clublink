import {
  joinClub,
  requestJoinClub,
  approveRequest,
  denyRequest,
  expireRequest,
  activateMembership,
  deactivateMembership,
} from "../../src/utils/club";

import pool from "../../src/db/db";
import { addAudit } from "../../src/utils/audit";

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("../../src/utils/audit", () => ({
  addAudit: jest.fn(),
}));

describe("Club Utils", () => {
  const mockUserId = 1;
  const mockClubId = "2";
  const mockRequestId = "3";
  const mockDate = new Date("2025-04-13T20:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("joinClub", () => {
    it("should insert membership and calculate ratio", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { studentnumber: "123456" },
          { studentnumber: null },
          { studentnumber: null },
        ],
      });
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await joinClub(mockClubId, mockUserId);

      expect(pool.query).toHaveBeenNthCalledWith(
        3,
        "UPDATE clubs SET ratio = $1 WHERE id = $2",
        [2 / 1, mockClubId]
      );
    });

    it("should set ratio to 0 when there are no students", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ studentnumber: null }],
      });
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await joinClub(mockClubId, mockUserId);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE clubs SET ratio = $1 WHERE id = $2",
        [0, mockClubId]
      );
    });

    it("should throw an error if query fails", async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await expect(joinClub(mockClubId, mockUserId)).rejects.toThrow(
        "DB Error"
      );
    });
  });

  describe("requestJoinClub", () => {
    it("should insert a request", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await requestJoinClub(mockClubId, mockUserId);

      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO requests (memberId, clubId) VALUES ($1, $2)",
        [mockUserId, mockClubId]
      );
    });
  });

  describe("approveRequest", () => {
    it("should update, audit, and join club", async () => {
      const mockResult = {
        rows: [{ clubid: mockClubId, memberid: mockUserId }],
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockResult)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ studentnumber: "123" }] })
        .mockResolvedValueOnce({});

      await approveRequest(mockRequestId, mockUserId);

      expect(addAudit).toHaveBeenCalledWith(
        mockClubId,
        mockUserId,
        mockUserId,
        "approve"
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        "UPDATE requests SET status = 'Approved', approverid = $1, updated_at = $2 WHERE id = $3 RETURNING clubid, memberid",
        [mockUserId, mockDate.toISOString(), mockRequestId]
      );
    });

    it("should throw if no rows returned", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(approveRequest(mockRequestId, mockUserId)).rejects.toThrow(
        "Unable to approve request: No rows returned"
      );
    });

    it("should throw if userId is missing", async () => {
      await expect(approveRequest(mockRequestId, undefined)).rejects.toThrow(
        "No User Id"
      );
    });
  });

  describe("denyRequest", () => {
    it("should deny and audit", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ clubid: "2", memberid: "1" }],
      });

      await denyRequest(mockRequestId, mockUserId);

      expect(addAudit).toHaveBeenCalledWith("2", 1, mockUserId, "deny");
    });

    it("should throw if no userId", async () => {
      await expect(denyRequest(mockRequestId, undefined)).rejects.toThrow(
        "No User Id"
      );
    });

    it("should throw if no rows returned", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(denyRequest(mockRequestId, mockUserId)).rejects.toThrow(
        "Unable to process request: No rows returned"
      );
    });
  });

  describe("expireRequest", () => {
    it("should mark a request as cancelled", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await expireRequest(mockRequestId);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE requests SET status = 'Cancelled', updated_at = $1 WHERE id = $2",
        [mockDate.toISOString(), mockRequestId]
      );
    });
  });

  describe("activateMembership", () => {
    it("should activate and audit", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await activateMembership(mockUserId, mockClubId);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE MemberList SET status = 'Active' WHERE memberId = $1 AND clubId = $2",
        [mockUserId, mockClubId]
      );
      expect(addAudit).toHaveBeenCalledWith(
        +mockClubId,
        mockUserId,
        undefined,
        "Activate Membership"
      );
    });
  });

  describe("deactivateMembership", () => {
    it("should deactivate and audit", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      await deactivateMembership(mockUserId, mockClubId);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE MemberList SET status = 'Expired' WHERE userId = $1 and clubId = $2",
        [mockUserId, mockClubId]
      );
      expect(addAudit).toHaveBeenCalledWith(
        +mockClubId,
        mockUserId,
        undefined,
        "Deactivate Membership"
      );
    });
  });
});
