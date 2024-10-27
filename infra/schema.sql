-- Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    isActive BOOLEAN DEFAULT false,
    isStudent BOOLEAN DEFAULT false,
    studentNumber VARCHAR(10),
    isSuperAdmin BOOLEAN DEFAULT false,
);

-- Clubs
CREATE TABLE Clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    description TEXT,
    shortDescription VARCHAR(255),
    image TEXT
);

-- MemberList
CREATE TABLE MemberList (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    clubId INT REFERENCES Club(id) ON DELETE CASCADE,
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
    price DECIMAL (10, 2) NOT NULL,
);

-- Transactions
CREATE TABLE Transactions (
    id SERIAL PRIMARY KEY,
    memberId INT REFERENCES Users(id) ON DELETE CASCADE,
    ticketId INT REFERENCES Tickets (id) ON DELETE CASCADE,
)