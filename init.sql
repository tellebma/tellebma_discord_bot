-- init.sql

-- events
CREATE TABLE events (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    initial VARCHAR(50),
    competition_name VARCHAR(255),
    team_domicile VARCHAR(500),
    team_exterieur VARCHAR(500),
    team_name_domicile VARCHAR(255),
    team_name_exterieur VARCHAR(255),
    score_domicile VARCHAR(255) NULL,
    score_exterieur VARCHAR(255) NULL,
    player TEXT NULL,
    date_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    date_end TIMESTAMP WITHOUT TIME ZONE NULL,
    link TEXT,
    has_notif_been_send BOOLEAN DEFAULT FALSE,
    has_result_been_send BOOLEAN DEFAULT FALSE,
    stream_link VARCHAR(255)
);

-- Index pour accélérer les requêtes de tri/filtrage sur les dates
CREATE INDEX idx_events_start ON events(date_start);
CREATE INDEX idx_events_competition ON events(competition_name);


