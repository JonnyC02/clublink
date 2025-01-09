import request from 'supertest';
import app from '../../src/index';
import pool from '../../src/db/db';

jest.mock('../../src/utils/authentication', () => ({
    ...jest.requireActual('../../src/utils/authentication'),
    authenticateToken: jest.fn((req, res, next) => {
      req.user = { id: 1 };
      next();
    }),
    getUserId: jest.fn(() => 1),
  }));

describe('Clubs API Integration Tests', () => {
  beforeAll(async () => {
    await pool.query(`
        DO $$
            BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'club_type_enum') THEN
                CREATE TYPE club_type_enum AS ENUM ('Club', 'Society');
            END IF;
        END $$;
    `);

    await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_type_enum') THEN
            CREATE TYPE member_type_enum AS ENUM ('Member', 'Committee');
          END IF;
        END $$;
      `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS Universities (
        id SERIAL PRIMARY KEY,
        acronym VARCHAR(5) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL UNIQUE,
        superAdminIds JSON NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        latitude NUMERIC,
        longitude NUMERIC,
        image TEXT
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Clubs (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE,
            description TEXT,
            shortDescription VARCHAR(255),
            university VARCHAR(5) REFERENCES Universities(acronym) ON DELETE CASCADE,
            clubType club_type_enum DEFAULT 'Society',
            latitude DECIMAL(9, 6),
            longitude DECIMAL (9, 6),
            headerImage TEXT,
            image TEXT
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            isActive BOOLEAN DEFAULT false,
            studentNumber VARCHAR(10),
            university VARCHAR(5) REFERENCES Universities(acronym) ON DELETE CASCADE,
            isSuperAdmin BOOLEAN DEFAULT false
        );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS MemberList (
            id SERIAL PRIMARY KEY,
            memberId INT REFERENCES Users(id) ON DELETE CASCADE,
            clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
            memberType member_type_enum DEFAULT 'Member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`INSERT INTO universities (acronym, name, superadminIds, email) VALUES ('QUB', 'Test Uni', '[]', 'test@example.com') ON CONFLICT (acronym) DO NOTHING;`)

    await pool.query(`
      INSERT INTO Clubs (name, shortdescription, description, university, latitude, longitude, clubtype)
      VALUES
      ('Test Club', 'Short desc', 'Detailed desc', 'QUB', 40.7128, -74.0060, 'Club');
    `);
  });

  afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS MemberList, Users, Clubs, Universities CASCADE;');
    await pool.query('DROP TYPE IF EXISTS club_type_enum, member_type_enum CASCADE;');
    await pool.end();
  });
  
  describe('POST / (fetch clubs)', () => {
    it('should fetch a list of clubs sorted by popularity and universityPriority', async () => {
      const res = await request(app).post('/clubs').send({ latitude: 40.7128, longitude: -74.0060 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('name', 'Test Club');
      expect(res.body[0]).toHaveProperty('university', 'QUB');
    });

    it('should handle missing latitude and longitude', async () => {
      const res = await request(app).post('/clubs').send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /:id (fetch specific club)', () => {
    it('should fetch a specific club by ID', async () => {
      const res = await request(app).get('/clubs/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test Club');
      expect(res.body).toHaveProperty('description', 'Detailed desc');
    });

    it('should return 404 for a non-existent club', async () => {
      const res = await request(app).get('/clubs/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Club not found.');
    });

    it('should handle invalid ID format', async () => {
      const res = await request(app).get('/clubs/invalid');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /upload (upload file)', () => {
    it('should upload a file to S3 and return the URL', async () => {
      const fileBuffer = Buffer.from('dummy file content');
      const res = await request(app)
        .post('/clubs/upload')
        .field('clubId', '1')
        .attach('file', fileBuffer, 'testfile.txt');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'File uploaded successfully.');
      expect(res.body).toHaveProperty('url');
    });

    it('should return 400 if no file is provided', async () => {
      const res = await request(app).post('/clubs/upload').send({ clubId: 1 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'File and clubId are required.');
    });

    it('should return 400 if clubId is missing', async () => {
      const fileBuffer = Buffer.from('dummy file content');
      const res = await request(app).post('/clubs/upload').attach('file', fileBuffer, 'testfile.txt');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /:id/edit (edit club details)', () => {
    it('should update club details', async () => {
      const updatedDetails = { description: 'Updated description', shortDescription: 'Updated short desc', headerImage: 'new_image.jpg' };
      const res = await request(app).post('/clubs/1/edit').send(updatedDetails);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Club details updated successfully.');
    });

    it('should return 404 for a non-existent club', async () => {
      const res = await request(app).post('/clubs/999/edit').send({ description: 'Test' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Club not found.');
    });
  });
});