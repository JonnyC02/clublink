/* eslint-disable @typescript-eslint/no-explicit-any */
import queue, { stopQueue } from "../../src/utils/queue";
import pool from "../../src/db/db";
import { sendEmail } from "../../src/utils/email";
import { generateRequestToken } from "../../src/utils/tokens";

jest.mock("node-cron", () => ({
  schedule: jest.fn((_, task) => ({
    start: jest.fn(),
    stop: jest.fn(),
    task,
  })),
}));

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("../../src/utils/email", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../../src/utils/tokens", () => ({
  generateRequestToken: jest.fn(() => "mock-token"),
}));

describe("queue", () => {
  const mockFrontendUrl = "http://localhost:3000";

  const oldEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...oldEnv,
      FRONTEND_URL: mockFrontendUrl,
      EMAIL_USER: "noreply@example.com",
    };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("should not do anything if there are no pending requests", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const task = (queue as any).task;
    await task();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should skip sending email if ratio is too high", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            club_id: "123",
            club_name: "Chess Club",
            user_email: "user@example.com",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            student_count: "2",
            associate_count: "2",
          },
        ],
      });

    const task = (queue as any).task;
    await task();

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should send email if ratio is low enough", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            club_id: "123",
            club_name: "Robotics Club",
            user_email: "user@example.com",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            student_count: "10",
            associate_count: "1",
          },
        ],
      });

    const task = (queue as any).task;
    await task();

    expect(generateRequestToken).toHaveBeenCalledWith(1);
    expect(sendEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({
        subject: expect.stringContaining("Space in"),
        html: expect.stringContaining("You're Invited to Join Robotics Club"),
      })
    );
  });

  it("should generate correct accept and decline URLs", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            request_id: 42,
            club_id: "abc",
            club_name: "SciFi Club",
            user_email: "sci@example.com",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ student_count: "5", associate_count: "0" }],
      });

    const task = (queue as any).task;
    await task();

    expect(sendEmail).toHaveBeenCalledWith(
      "sci@example.com",
      expect.objectContaining({
        html: expect.stringContaining(
          `${mockFrontendUrl}/accept?token=mock-token`
        ),
      })
    );
  });

  it("should stop the queue when stopQueue is called", () => {
    const stop = jest.fn();
    (queue as any).stop = stop;

    stopQueue();

    expect(stop).toHaveBeenCalled();
  });
});
