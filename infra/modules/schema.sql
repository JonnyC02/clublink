-- Create ENUM Type for types
CREATE TYPE club_type_enum AS ENUM ('Club', 'Society');
CREATE TYPE member_type_enum AS ENUM('Member', 'Committee');
CREATE TYPE request_type_enum AS ENUM('Approved', 'Pending', 'Denied', 'Cancelled');

-- Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT false,
    studentNumber VARCHAR(10),
    university VARCHAR(5) REFERENCES Universities(acronym) ON DELETE CASCADE,
    isSuperAdmin BOOLEAN DEFAULT false
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
    headerImage TEXT,
    image TEXT
);

-- MemberList
CREATE TABLE MemberList (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberType member_type_enum DEFAULT 'Member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
);

-- Events
CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    time TIMESTAMP
);

-- Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    eventId INT REFERENCES Events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Transactions
CREATE TABLE Transactions (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    ticketId INT REFERENCES Tickets(id) ON DELETE CASCADE
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
    image TEXT
);

-- Requests
CREATE TABLE Requests (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    status request_type_enum DEFAULT 'Pending',
    approverId INT REFERENCES Users(id) ON DELETE CASCADE,
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