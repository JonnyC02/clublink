import { addAudit } from "../../src/utils/audit";
import pool from "../../src/db/db";

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

describe("Audit Utils", () => {
  const mockClubId = 1;
  const mockUserId = 2;
  const mockMemberId = 3;
  const mockAction = "Approved Request";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should insert a new audit log entry", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({});

    await addAudit(mockClubId, mockUserId, mockMemberId, mockAction);

    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO auditlog (clubid, memberid, userid, actiontype) VALUES ($1, $2, $3, $4);`,
      [mockClubId, mockMemberId, mockUserId, mockAction]
    );
  });

  it("should throw an error if the query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(
      new Error("Database Error")
    );

    await expect(
      addAudit(mockClubId, mockUserId, mockMemberId, mockAction)
    ).rejects.toThrow("Database Error");
  });
});
