import request from 'supertest';
import app from '../../src/index';
import { generateVerificationToken } from '../../src/utils/tokens';
import { sendVerificationEmail } from '../../src/utils/email';
import { authenticateToken } from '../../src/utils/authentication';
import { pool } from '../../src/db/db';
import bcrypt from 'bcryptjs'

// Mock utilities
jest.mock('../../src/utils/tokens', () => ({
  generateVerificationToken: jest.fn(() => 'mock_verification_token'),
}));

jest.mock('../../src/utils/email', () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock('../../src/utils/authentication', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1 }; // Simulate authenticated user
    next();
  }),
}));

const mockedAuthenticateToken = authenticateToken as jest.Mock;

describe('Authentication API Integration Tests', () => {
  let mockQuery: jest.Mock;

  beforeAll(() => {
    // Mock database pool
    mockQuery = jest.fn();
    pool.query = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 }); // No user found

      const res = await request(app).post('/auth/login').send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return 403 if the email is not verified', async () => {
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, email: 'test@example.com', password: 'hashed_password', isactive: false }],
      });

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Your email is not verified!');
    });

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = '$2a$10$wxyz1234'; // Example hashed password
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true); // Mock bcrypt.compare

      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, email: 'test@example.com', password: hashedPassword, isactive: true }],
      });

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /auth/signup', () => {
    it('should sign up a new user', async () => {
      mockQuery
        .mockResolvedValueOnce({ rowCount: 0 }) // No existing user
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Inserted user

      const res = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword',
        studentNumber: '12345',
        university: 'Test University',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'User created!');
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'mock_verification_token');
    });

    it('should return 400 if the email is already in use', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 }); // Existing user

      const res = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email already in use');
    });
  });

  describe('GET /auth/user', () => {
    it('should fetch user details for an authenticated user', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 1, name: 'Test User', email: 'test@example.com', studentNumber: '12345', university: 'Test University' }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 1, name: 'Club 1' }, { id: 2, name: 'Club 2' }],
        });

      const res = await request(app)
        .get('/auth/user')
        .set('Authorization', 'Bearer valid_token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        isStudent: true,
        studentNumber: '12345',
        university: 'Test University',
        clubs: [{ id: 1, name: 'Club 1' }, { id: 2, name: 'Club 2' }],
      });
    });

    it('should return 400 if user ID is not provided', async () => {
      mockedAuthenticateToken.mockImplementationOnce((req, res, next) => {
        req.user = null; // Simulate missing user
        next();
      });

      const res = await request(app).get('/auth/user');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User ID not provided.');
    });

    it('should return 404 if the user does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 }); // No user found

      const res = await request(app)
        .get('/auth/user')
        .set('Authorization', 'Bearer valid_token');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found.');
    });
  });
});