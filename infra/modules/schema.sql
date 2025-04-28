-- Create ENUM Type for types
CREATE TYPE club_type_enum AS ENUM ('Club', 'Society');
CREATE TYPE member_type_enum AS ENUM('Member', 'Committee');
CREATE TYPE request_type_enum AS ENUM('Approved', 'Pending', 'Denied', 'Cancelled');
CREATE TYPE ticket_type_enum AS ENUM('Membership', 'Event');
CREATE TYPE ticket_flag_enum AS ENUM('Student', 'Associate');
CREATE TYPE ticket_expiry_enum AS ENUM('Academic', 'Yearly');
CREATE TYPE transaction_status_enum AS ENUM('processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'disputed');
CREATE TYPE transaction_type_enum AS ENUM('Card', 'Cash');
CREATE TYPE member_status_enum AS ENUM('Active', 'Pending', 'Expired');

-- Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT false,
    studentNumber VARCHAR(10),
    university VARCHAR(5) REFERENCES Universities(acronym),
    verifiedStudent BOOLEAN DEFAULT false
);

-- Clubs
CREATE TABLE Clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    description TEXT,
    shortDescription VARCHAR(255),
    university VARCHAR(5) REFERENCES Universities(acronym) ON DELETE CASCADE,
    clubType club_type_enum DEFAULT 'Society',
    latitude DECIMAL(9, 6),
    longitude DECIMAL (9, 6),
    ratio DECIMAL(6, 4),
    headerImage TEXT,
    image TEXT
);

-- MemberList
CREATE TABLE MemberList (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberType member_type_enum DEFAULT 'Member',
    status member_status_enum DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    time TIMESTAMP
);

-- Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    eventId INT REFERENCES Events(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    clubId INT REFERENCES Clubs(id),
    ticketType ticket_type_enum DEFAULT 'Event',
    ticketFlag ticket_flag_enum DEFAULT 'Associate',
    ticketExpiry ticket_expiry_enum DEFAULT 'Yearly',
    cashEnabled BOOLEAN DEFAULT true,
    bookingFee BOOLEAN DEFAULT true,
    date VARCHAR(15)
);

-- Transactions
CREATE TABLE Transactions (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) NOT NULL ON DELETE CASCADE,
    ticketId INT REFERENCES Tickets(id) NOT NULL ON DELETE CASCADE,
    amount DECIMAL (5, 2) NOT NULL,
    clubId INT REFERENCES Clubs(id),
    status transaction_status_enum DEFAULT 'succeeded',
    type transaction_type_enum,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    promoCode INT REFERENCES PromoCodes(id),
    transactionType BOOLEAN,
    updated_at TIMESTAMP
);

-- Universities
CREATE TABLE Universities (
    id SERIAL,
    acronym VARCHAR(5) NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    superAdminIds JSON NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    latitude DECIMAL(9, 6),
    longitude DECIMAL (9, 6),
    studentVerification VARCHAR(30) NOT NULL,
    image TEXT
);

-- Requests
CREATE TABLE Requests (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    status request_type_enum DEFAULT 'Pending',
    approverId INT REFERENCES Users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- AuditLog
CREATE TABLE AuditLog (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    userId INT REFERENCES Users(id) ON DELETE CASCADE,
    actionType VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PromoCodes
CREATE TABLE PromoCodes (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id),
    ticketId INT REFERENCES Tickets(id),
    discount DECIMAL(3, 2) CHECK (discount <= 1),
    maxUse INT DEFAULT 0,
    expiryDate TIMESTAMP,
    code VARCHAR(10) NOT NULL
);

-- Newsletter
CREATE TABLE Newsletter (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE
);