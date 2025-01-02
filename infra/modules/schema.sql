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
    image TEXT
);

-- MemberList
CREATE TABLE MemberList (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    memberType VARCHAR(50)
);

-- ClubEvents
CREATE TABLE ClubEvents (
    id SERIAL PRIMARY KEY,
    clubId INT REFERENCES Clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255)
);

-- Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    eventId INT REFERENCES ClubEvents(id) ON DELETE CASCADE,
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
    id SERIAL PRIMARY KEY,
    acronym VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    superAdminIds JSON NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    image TEXT
);