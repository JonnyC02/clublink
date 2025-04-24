import nodemailer from "nodemailer";
import { MailOptions } from "../types/MailOptions";

export const sendVerificationEmail = async (email: string, token: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email configuration");
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Please verify your email by clicking the link below:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  await sendEmail(email, mailOptions);
};

export const sendStudentVerifyEmail = async (email: string, token: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email configuration");
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/studentVerify?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Student Status",
    html: `<p>Please verify your student status by clicking the link below:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  await sendEmail(email, mailOptions);
};

export const sendRemovalEmail = async (email: string, clubName: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email configuration");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Removed from ${clubName}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center;">
        <h2 style="color: #2d3748;">You've been removed from <span style="color: #4299e1;">${clubName}</span></h2>
        <p style="color: #4a5568; font-size: 16px;">We wanted to let you know that your membership with <strong>${clubName}</strong> has been removed.</p>
      </div>

      <div style="margin-top: 20px; font-size: 15px; color: #4a5568; line-height: 1.6;">
        <p>If you believe this was a mistake or have any questions, please contact your club administrator.</p>

        <p style="margin-top: 12px;">
          You can continue exploring other clubs on ClubLink anytime.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.FRONTEND_URL
          }" style="display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Browse Clubs</a>
        </div>
      </div>

      <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #a0aec0;">
        If you have questions, reach out at <a href="mailto:support@clublink.live" style="color: #3182ce;">support@clublink.live</a>.
        <br/>
        &copy; ${new Date().getFullYear()} ClubLink. All rights reserved.
      </div>
    </div>
    `,
  };

  await sendEmail(email, mailOptions);
};

export const sendExpiryEmail = async (email: string, clubName: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email configuration");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${clubName} membership expired!`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fefefe; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.07);">
        <div style="text-align: center;">
          <h2 style="color: #2d3748;">Your <span style="color: #3182ce;">${clubName}</span> membership has expired</h2>
          <p style="color: #4a5568; font-size: 16px;">We wanted to let you know that your membership with <strong>${clubName}</strong> has ended.</p>
        </div>

        <div style="margin-top: 20px; color: #4a5568; font-size: 15px; line-height: 1.6;">
          <p>If this was unexpected, or you’d like to renew your membership, you can rejoin the club or browse other available options on ClubLink.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.FRONTEND_URL
            }/clubs" style="display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Browse Clubs
            </a>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #a0aec0;">
          If you have questions, reach out to us at 
          <a href="mailto:support@clublink.live" style="color: #4299e1;">support@clublink.live</a>.
          <br />
          &copy; ${new Date().getFullYear()} ClubLink. All rights reserved.
        </div>
      </div>`,
  };

  await sendEmail(email, mailOptions);
};

export const sendActivateEmail = async (
  email: string,
  clubName: string,
  clubId: number
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email configuration");
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${clubName} membership activated`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
        <div style="text-align: center;">
          <h2 style="color: #2d3748;">🎉 Welcome to <span style="color: #3182ce;">${clubName}</span>!</h2>
          <p style="font-size: 16px; color: #4a5568;">Your membership has been successfully activated.</p>
        </div>

        <div style="margin-top: 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">
          <p>We're excited to have you as part of the club! You now have access to all exclusive events, updates, and opportunities.</p>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.FRONTEND_URL}/clubs/${clubId}" 
               style="display: inline-block; padding: 12px 24px; background-color: #38a169; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Club Page
            </a>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #a0aec0;">
          Need help? Contact us at 
          <a href="mailto:support@clublink.live" style="color: #4299e1;">support@clublink.live</a>.
          <br />
          &copy; ${new Date().getFullYear()} ClubLink. All rights reserved.
        </div>
      </div>`,
  };

  await sendEmail(email, mailOptions);
};

export const sendEmail = async (email: string, mailOptions: MailOptions) => {
  if (!email) {
    throw new Error("Email address is required");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing Email Config");
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transport.sendMail(mailOptions);
};
