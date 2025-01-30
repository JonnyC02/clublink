import cron from "node-cron";
import pool from "../db/db";
import dotenv from "dotenv";
import { sendEmail } from "./email";
import { MailOptions } from "../types/MailOptions";
dotenv.config();

const queue = cron.schedule(
  "0 0 * * *",
  async () => {
    const requests = await pool.query("SELECT * FROM requests");

    if (requests.rows.length === 0) {
      return;
    }

    const clubRatios: { [clubId: number]: number } = {};

    for (const request of requests.rows) {
      const clubData = await pool.query(
        "SELECT id, name FROM clubs WHERE id = $1",
        [request.clubid]
      );
      const clubId = clubData.rows[0].id;

      const memberCounts = await pool.query(
        `SELECT 
     SUM(CASE WHEN type = 'Student' THEN 1 ELSE 0 END) AS student_count,
     SUM(CASE WHEN type = 'Associate' THEN 1 ELSE 0 END) AS associate_count
   FROM memberlist 
   WHERE clubid = $1`,
        [clubId]
      );

      const studentCount =
        parseInt(memberCounts.rows[0].student_count, 10) || 0;
      const associateCount =
        parseInt(memberCounts.rows[0].associate_count, 10) || 0;

      const currentRatio =
        clubRatios[clubId] ?? associateCount / (studentCount + associateCount);

      if (currentRatio >= 0.2) {
        continue;
      }

      const user = await pool.query("SELECT email FROM users WHERE id = $1", [
        request.memberid,
      ]);
      const email = user.rows[0].email;
      const name = clubData.rows[0].name;
      const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Space in ${name}`,
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center;">You're Invited to Join ${name} Club!</h2>
        <p style="text-align: center;">Great news! A spot has opened up in <strong>${name}</strong>, and we’d love to have you onboard.</p>
        <p style="font-weight: bold; text-align: center;">You have 48 hours to accept or decline this invitation before it expires.</p>

        <div style="margin: 20px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/accept?reqId=${request.id}&clubId=${clubId}" 
             style="display: inline-block; padding: 12px 20px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
             ✅ Accept Invitation
          </a>

          <a href="${process.env.FRONTEND_URL}/decline?reqId=${request.id}&clubId=${clubId}"
             style="display: inline-block; padding: 12px 20px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
             ❌ Decline Invitation
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #555; text-align: center;">If you do not respond within 48 hours, your spot will be offered to the next person on the waitlist.</p>

        <p style="color: #777; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `,
      };
      await sendEmail(email, mailOptions);
      clubRatios[clubId] =
        (associateCount + 1) / (studentCount + associateCount + 1);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

export default queue;
