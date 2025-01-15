import nodemailer from 'nodemailer';
import { sendVerificationEmail } from '../../src/utils/email';

jest.mock('nodemailer');

const mockTransporter = {
    sendMail: jest.fn(),
};

(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

describe('Email Utils - sendVerificationEmail', () => {
    const originalEnv = process.env;
    const mockEmail = 'test@example.com';
    const mockToken = 'mockToken123';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, EMAIL_USER: 'testuser@example.com', EMAIL_PASSWORD: 'testpassword', FRONTEND_URL: 'http://localhost:3000' };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

const normalizeHtml = (html: string): string => {
    return html.replace(/\s+/g, ' ').trim();
};

it('should send a verification email successfully', async () => {
    await sendVerificationEmail(mockEmail, mockToken);

    const expectedHtml = `<p>Please verify your email by clicking the link below:</p>
                          <a href="http://localhost:3000/verify?token=mockToken123">http://localhost:3000/verify?token=mockToken123</a>`;
    
    const actualHtml = mockTransporter.sendMail.mock.calls[0][0].html;
    expect(normalizeHtml(actualHtml)).toBe(normalizeHtml(expectedHtml));

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: mockEmail,
        subject: 'Verify Your Email',
        html: actualHtml,
    });
});

    

    it('should handle missing email configuration gracefully', async () => {
        process.env.EMAIL_USER = undefined;
        process.env.EMAIL_PASSWORD = undefined;

        await expect(sendVerificationEmail(mockEmail, mockToken)).rejects.toThrow('Missing email configuration');
    });

    it('should throw an error if sending email fails', async () => {
        mockTransporter.sendMail.mockRejectedValueOnce(new Error('Failed to send email'));

        await expect(sendVerificationEmail(mockEmail, mockToken)).rejects.toThrow('Failed to send email');
        expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should generate the correct verification URL', async () => {
        const expectedUrl = `${process.env.FRONTEND_URL}/verify?token=${mockToken}`;
        await sendVerificationEmail(mockEmail, mockToken);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringContaining(expectedUrl),
            })
        );
    });
});